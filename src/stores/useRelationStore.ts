import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import { getAppState, setAppState } from '@/db/repositories/appStateRepo';
import {
  ACTIVITY_META,
  RELATION_DECAY_PER_DAY,
  RELATION_DEFAULT_MAX_HEALTH,
  RELATION_ESTRANGED_RESTORE,
  RELATION_MILESTONES,
} from '@/constants/relations';
import { relationStats } from '@/constants/progression';
import { awardXp } from '@/services/progression';
import {
  deleteActivity as deleteActivityRepo,
  deleteRelation as deleteRelationRepo,
  getActivities,
  getMilestones,
  getRelations,
  insertActivity,
  insertMilestone,
  insertRelation,
  updateMilestone,
  updateRelation,
} from '@/db/repositories/relationRepo';
import type { Relation, RelationActivity, RelationActivityType, RelationMilestone, RelationType, StatName } from '@/types';
import { createId, todayISO } from '@/utils/id';

const DECAY_KEY = 'relation_decay_date';

function epochDay(iso: string): number {
  return Math.floor(new Date(iso).getTime() / (24 * 60 * 60 * 1000));
}

interface RelationState {
  relations: Relation[];
  activities: RelationActivity[];
  milestones: RelationMilestone[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addRelation: (input: { name: string; relationType: RelationType; avatar?: string }) => Promise<void>;
  updateRelation: (id: string, patch: Partial<Pick<Relation, 'name' | 'relationType' | 'avatar'>>) => Promise<void>;
  deleteRelation: (id: string) => Promise<void>;
  logActivity: (relationId: string, type: RelationActivityType, input?: { durationMinutes?: number; note?: string; customHealth?: number; customXp?: number }) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
}

export const useRelationStore = create<RelationState>()((set, get) => {
  async function seedMilestones(relationId: string): Promise<void> {
    for (const def of RELATION_MILESTONES) {
      await insertMilestone({
        id: createId('ms'),
        relationId,
        level: def.level,
        title: def.title,
        description: def.description,
        requiredActivities: JSON.stringify({ countType: def.countType, count: def.count }),
        rewardStat: def.rewardStat,
        rewardPoints: def.rewardPoints,
        isUnlocked: false,
        unlockedAt: null,
      });
    }
  }

  async function checkMilestones(relationId: string): Promise<boolean> {
    const { activities, milestones, relations } = get();
    const relation = relations.find((r) => r.id === relationId);
    if (!relation) return false;
    const relActivities = activities.filter((a) => a.relationId === relationId);
    let changed = false;
    let { maxHealth, level } = relation;
    for (const ms of milestones.filter((m) => m.relationId === relationId && !m.isUnlocked).sort((a, b) => a.level - b.level)) {
      const req = JSON.parse(ms.requiredActivities || '{}') as { countType: RelationActivityType; count: number };
      const count = relActivities.filter((a) => a.type === req.countType).length;
      if (count >= req.count) {
        await updateMilestone(ms.id, { isUnlocked: true, unlockedAt: new Date().toISOString() });
        maxHealth += RELATION_MILESTONES.find((d) => d.level === ms.level)?.healthBonus ?? 0;
        level = Math.max(level, ms.level);
        if (ms.rewardStat && ms.rewardPoints) {
          void awardXp({ module: 'covenant', action: 'milestone', entityId: ms.id, xp: 0, statChanges: { [ms.rewardStat as StatName]: ms.rewardPoints } });
        }
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        changed = true;
      }
    }
    if (changed) {
      await updateRelation(relationId, { maxHealth, level });
    }
    return changed;
  }

  return {
    relations: [],
    activities: [],
    milestones: [],
    hydrated: false,

    hydrate: async () => {
      try {
        const relations = await getRelations();
        const today = todayISO();
        const decayRaw = await getAppState(DECAY_KEY);
        let decayed = relations;
        if (decayRaw !== today) {
          const days = Math.max(1, epochDay(today) - epochDay(decayRaw ?? today));
          decayed = relations.map((r) => {
            const health = Math.max(0, r.health - days * RELATION_DECAY_PER_DAY);
            if (health !== r.health) {
              updateRelation(r.id, { health }).catch(() => {});
              return { ...r, health };
            }
            return r;
          });
          await setAppState(DECAY_KEY, today);
        }
        const [activities, milestones] = await Promise.all([getActivities(), getMilestones()]);
        set({ relations: decayed, activities, milestones, hydrated: true });
      } catch (error) {
        console.error('Failed to hydrate relations', error);
        set({ hydrated: true });
      }
    },

    addRelation: async ({ name, relationType, avatar = '' }) => {
      const relation: Relation = {
        id: createId('rel'),
        name,
        relationType,
        health: RELATION_DEFAULT_MAX_HEALTH,
        maxHealth: RELATION_DEFAULT_MAX_HEALTH,
        level: 1,
        xp: 0,
        lastInteraction: null,
        avatar,
        createdAt: new Date().toISOString(),
      };
      await insertRelation(relation);
      await seedMilestones(relation.id);
      await get().hydrate();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },

    updateRelation: async (id, patch) => {
      await updateRelation(id, patch);
      const relations = await getRelations();
      set({ relations });
    },

    deleteRelation: async (id) => {
      await deleteRelationRepo(id);
      const relations = get().relations.filter((r) => r.id !== id);
      const activities = get().activities.filter((a) => a.relationId !== id);
      const milestones = get().milestones.filter((m) => m.relationId !== id);
      set({ relations, activities, milestones });
    },

    logActivity: async (relationId, type, input) => {
      const relation = get().relations.find((r) => r.id === relationId);
      if (!relation) return;
      const meta = ACTIVITY_META[type];
      const estranged = relation.health <= 0;
      if (estranged && type !== 'reconcile') {
        return;
      }
      const restore =
        type === 'custom' ? (input?.customHealth ?? 0) : type === 'reconcile' ? RELATION_ESTRANGED_RESTORE : meta.health;
      const xp =
        type === 'custom' ? (input?.customXp ?? 0) : type === 'reconcile' ? meta.xp : meta.xp;
      const health = estranged && type === 'reconcile' ? RELATION_ESTRANGED_RESTORE : Math.min(relation.maxHealth, relation.health + restore);
      await insertActivity({
        id: createId('act'),
        relationId,
        type,
        durationMinutes: input?.durationMinutes ?? null,
        note: input?.note ?? '',
        date: todayISO(),
        healthRestored: restore,
        xpEarned: xp,
      });
      const nextXp = relation.xp + xp;
      await updateRelation(relationId, { health, xp: nextXp, lastInteraction: new Date().toISOString() });
      void awardXp({ module: 'covenant', action: type, entityId: relationId, xp, statChanges: relationStats(type) });
      const activities = await getActivities();
      set({ activities });
      const changed = await checkMilestones(relationId);
      void changed;
      const [relations, milestones] = await Promise.all([getRelations(), getMilestones()]);
      set({ relations, milestones });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    },

    deleteActivity: async (id) => {
      const act = get().activities.find((a) => a.id === id);
      await deleteActivityRepo(id);
      const activities = get().activities.filter((a) => a.id !== id);
      if (act) {
        const rel = get().relations.find((r) => r.id === act.relationId);
        if (rel) {
          const health = Math.max(0, rel.health - act.healthRestored);
          const xp = Math.max(0, rel.xp - act.xpEarned);
          await updateRelation(act.relationId, { health, xp });
        }
      }
      set({ activities });
      const relations = await getRelations();
      set({ relations });
    },
  };
});
