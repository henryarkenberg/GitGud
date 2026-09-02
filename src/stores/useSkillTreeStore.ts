import { create } from 'zustand';

import { ROOT_NODE, DISCOVERY_SP_COST, REROLL_GOLD_COST, RARITY_META } from '@/constants/aetherium';
import {
  getConnections,
  getSkillNodes,
  insertConnection,
  insertSkillNode,
  updateSkillNode,
} from '@/db/repositories/skillTreeRepo';
import { getAllLedgerEntries } from '@/db/repositories/ledgerRepo';
import { awardXp, availableSp, refundSp, spendGold, spendSp } from '@/services/progression';
import { useUserStore } from '@/stores/useUserStore';
import type { NodeOption, SkillNodeType, SkillRarity, SkillTreeNode, StatName } from '@/types';
import { createId } from '@/utils/id';
import { countInBranch, fallbackOptions, positionForBranch, statBranch } from '@/utils/skilltree';
import { chat, extractJson } from '@/services/ai/openai';
import { NODE_DISCOVERY_SYSTEM, nodeDiscoveryPrompt } from '@/services/ai/prompts/nodeDiscovery';
import { NodeDiscoverySchema } from '@/services/ai/validators/schemas';

const DAY_MS = 24 * 60 * 60 * 1000;

function dominantStat(stats: Record<string, number>): StatName {
  let best: StatName = 'discipline';
  let bestVal = -1;
  for (const key of Object.keys(stats) as StatName[]) {
    if (stats[key] > bestVal) {
      bestVal = stats[key];
      best = key;
    }
  }
  return best;
}

interface SkillState {
  nodes: SkillTreeNode[];
  connections: { id: string; fromNodeId: string; toNodeId: string }[];
  options: NodeOption[];
  discoveryOpen: boolean;
  message: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  discover: () => Promise<void>;
  reRoll: () => Promise<void>;
  selectOption: (option: NodeOption) => Promise<void>;
  cancelDiscovery: () => Promise<void>;
  unlock: (id: string) => Promise<string | null>;
}

export const useSkillTreeStore = create<SkillState>()((set, get) => {
  async function seedRoot(): Promise<void> {
    const existing = await getSkillNodes();
    if (existing.some((n) => n.id === ROOT_NODE.id)) return;
    await insertSkillNode({
      id: ROOT_NODE.id,
      name: ROOT_NODE.name,
      description: ROOT_NODE.description,
      nodeType: 'badge',
      costSp: 0,
      requirements: {},
      rewards: {},
      rarity: 'legendary',
      relatedStat: 'discipline',
      positionX: 0,
      positionY: 0,
      isUnlocked: true,
      unlockedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }

  async function load() {
    const [nodes, connections] = await Promise.all([getSkillNodes(), getConnections()]);
    set({ nodes, connections, hydrated: true });
  }

  async function aiOptions(): Promise<NodeOption[]> {
    const profile = useUserStore.getState().profile;
    if (!profile?.aiSettings.apiKey?.trim()) return fallbackOptions(new Date().getDay());
    const ledger = await getAllLedgerEntries();
    const cutoff = Date.now() - 30 * DAY_MS;
    const week = ledger.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
    const byModule: Record<string, number> = {};
    for (const e of week) byModule[e.module] = (byModule[e.module] ?? 0) + e.xpChange;
    const context = JSON.stringify({
      dominantStat: dominantStat(profile.stats),
      stats: profile.stats,
      level: profile.level,
      unlockedNodes: get().nodes.filter((n) => n.isUnlocked).map((n) => n.name),
      topActivities: byModule,
    });
    const result = await chat({ system: NODE_DISCOVERY_SYSTEM, user: nodeDiscoveryPrompt(context), temperature: 0.9, kind: 'node_discovery' });
    if (!result.ok || !result.content) return fallbackOptions(new Date().getDay());
    try {
      const parsed = extractJson(result.content);
      const validated = NodeDiscoverySchema.safeParse(parsed);
      if (!validated.success) return fallbackOptions(new Date().getDay());
      return validated.data.options.slice(0, 3).map((o) => {
        const rarity = o.rarity as SkillRarity;
        return {
          id: createId('node'),
          name: o.name,
          description: o.description,
          nodeType: o.nodeType as SkillNodeType,
          rarity,
          relatedStat: o.relatedStat as StatName,
          costSp: o.costSp || RARITY_META[rarity].costSp,
          rewards: { stats: o.rewards.stats ?? {}, passive: o.rewards.passive, ability: o.rewards.ability },
          requirements: {
            minStat: (o.requirements.minStat as StatName) || undefined,
            minValue: o.requirements.minValue,
            activityProof: o.requirements.activityProof,
          },
        };
      });
    } catch {
      return fallbackOptions(new Date().getDay());
    }
  }

  return {
    nodes: [],
    connections: [],
    options: [],
    discoveryOpen: false,
    message: null,
    hydrated: false,

    hydrate: async () => {
      try {
        await seedRoot();
        await load();
      } catch (error) {
        console.error('Failed to hydrate skill tree', error);
        set({ hydrated: true });
      }
    },

    discover: async () => {
      const sp = await availableSp();
      if (sp < DISCOVERY_SP_COST) {
        set({ message: `You need ${DISCOVERY_SP_COST} SP to discover a node.` });
        return;
      }
      const ok = await spendSp(DISCOVERY_SP_COST);
      if (!ok) {
        set({ message: 'Not enough Skill Points.' });
        return;
      }
      const options = await aiOptions();
      set({ options, discoveryOpen: true, message: null });
    },

    reRoll: async () => {
      const profile = useUserStore.getState().profile;
      if (!profile || profile.gold < REROLL_GOLD_COST) {
        set({ message: `Re-roll costs ${REROLL_GOLD_COST} gold.` });
        return;
      }
      const ok = await spendGold(REROLL_GOLD_COST);
      if (!ok) return;
      const options = await aiOptions();
      set({ options, message: null });
    },

    selectOption: async (option) => {
      const index = countInBranch(get().nodes, option.relatedStat);
      const pos = positionForBranch(option.relatedStat, index);
      const node: SkillTreeNode = {
        id: option.id,
        name: option.name,
        description: option.description,
        nodeType: option.nodeType,
        costSp: option.costSp,
        requirements: option.requirements,
        rewards: option.rewards,
        rarity: option.rarity,
        relatedStat: option.relatedStat,
        positionX: pos.x,
        positionY: pos.y,
        isUnlocked: false,
        unlockedAt: null,
        createdAt: new Date().toISOString(),
      };
      await insertSkillNode(node);
      const unlocked = get().nodes.filter((n) => n.isUnlocked);
      let parent = unlocked.find((n) => n.relatedStat === option.relatedStat);
      if (!parent) {
        const branch = statBranch(option.relatedStat);
        let nearest = unlocked[0] ?? null;
        let best = Infinity;
        for (const n of unlocked) {
          const d = (n.positionX - branch.x) ** 2 + (n.positionY - branch.y) ** 2;
          if (d < best) {
            best = d;
            nearest = n;
          }
        }
        parent = nearest;
      }
      if (parent) await insertConnection(parent.id, node.id);
      await load();
      set({ discoveryOpen: false, options: [], message: null });
    },

    cancelDiscovery: async () => {
      await refundSp(DISCOVERY_SP_COST);
      set({ discoveryOpen: false, options: [], message: null });
    },

    unlock: async (id) => {
      const node = get().nodes.find((n) => n.id === id);
      if (!node || node.isUnlocked) return 'Already unlocked.';
      const profile = useUserStore.getState().profile;
      if (!profile) return 'No profile.';
      if (node.requirements.minStat) {
        const cur = profile.stats[node.requirements.minStat];
        if (cur < (node.requirements.minValue ?? 0)) {
          return `Requires ${node.requirements.minStat} ≥ ${node.requirements.minValue} (have ${cur}).`;
        }
      }
      const ok = await spendSp(node.costSp);
      if (!ok) return `Not enough SP (${node.costSp} required).`;
      await updateSkillNode(id, { isUnlocked: true, unlockedAt: new Date().toISOString() });
      if (node.rewards.stats) {
        void awardXp({ module: 'aetherium', action: 'unlock', entityId: id, xp: 0, statChanges: node.rewards.stats });
      }
      await load();
      return null;
    },
  };
});
