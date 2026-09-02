import type { SkillTreeNode, StatName } from '@/types';
import { STAT_NAMES } from '@/types';
import { NODE_TEMPLATES, RARITY_META, type NodeTemplate } from '@/constants/aetherium';

export function statBranch(stat: StatName): { x: number; y: number } {
  const idx = STAT_NAMES.indexOf(stat);
  const angle = (idx / STAT_NAMES.length) * Math.PI * 2 - Math.PI / 2;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function countInBranch(nodes: SkillTreeNode[], stat: StatName): number {
  return nodes.filter((n) => n.relatedStat === stat).length;
}

export function positionForBranch(stat: StatName, index: number): { x: number; y: number } {
  const branch = statBranch(stat);
  const radius = 150 + index * 95;
  return { x: Math.round(branch.x * radius), y: Math.round(branch.y * radius) };
}

export function templateToOption(t: NodeTemplate): import('@/types').NodeOption {
  const req = t.requirement ? { minStat: t.relatedStat, minValue: t.requirement[t.relatedStat] ?? 0 } : {};
  return {
    id: `${Date.now()}_${t.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: t.name,
    description: t.description,
    nodeType: t.nodeType,
    rarity: t.rarity,
    relatedStat: t.relatedStat,
    costSp: RARITY_META[t.rarity].costSp,
    rewards: { stats: t.stat, passive: t.passive, ability: t.ability },
    requirements: req,
  };
}

export function fallbackOptions(dayOfWeek: number): import('@/types').NodeOption[] {
  const pool = NODE_TEMPLATES.map((t) => templateToOption(t));
  const rotated = [...pool.slice(dayOfWeek), ...pool.slice(0, dayOfWeek)];
  return rotated.slice(0, 3);
}

export function shuffleOptions(options: import('@/types').NodeOption[]): import('@/types').NodeOption[] {
  const copy = [...options];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
