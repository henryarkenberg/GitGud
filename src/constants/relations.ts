import type { RelationActivityType, RelationType, StatName } from '@/types';

export const RELATION_DEFAULT_MAX_HEALTH = 100;
export const RELATION_DECAY_PER_DAY = 2;
export const RELATION_ESTRANGED_RESTORE = 50;
export const RELATION_ESTRANGED_HEALTH = 0;

export const RELATION_TYPES: RelationType[] = ['family', 'friend', 'mentor', 'colleague', 'spouse', 'child', 'other'];

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  family: 'Family',
  friend: 'Friend',
  mentor: 'Mentor',
  colleague: 'Colleague',
  spouse: 'Spouse',
  child: 'Child',
  other: 'Other',
};

export const ACTIVITY_META: Record<
  RelationActivityType,
  { label: string; health: number; xp: number }
> = {
  text: { label: 'Quick Text', health: 1, xp: 2 },
  call: { label: 'Phone Call 15m+', health: 5, xp: 10 },
  meet: { label: 'In-Person Meet', health: 10, xp: 25 },
  deep: { label: 'Deep Talk', health: 15, xp: 40 },
  help: { label: 'Helped with Problem', health: 12, xp: 30 },
  gift: { label: 'Gift', health: 8, xp: 15 },
  prayed: { label: 'Prayed Together', health: 20, xp: 50 },
  reconcile: { label: 'Reconciliation', health: 50, xp: 20 },
  custom: { label: 'Custom', health: 0, xp: 0 },
};

export const RELATION_ACTIVITY_TYPES = Object.keys(ACTIVITY_META) as RelationActivityType[];

export interface MilestoneDef {
  level: number;
  title: string;
  description: string;
  countType: RelationActivityType;
  count: number;
  healthBonus: number;
  rewardStat: StatName;
  rewardPoints: number;
}

export const RELATION_MILESTONES: MilestoneDef[] = [
  { level: 1, title: 'First Blood', description: 'Meet 3 times', countType: 'meet', count: 3, healthBonus: 5, rewardStat: 'charisma', rewardPoints: 5 },
  { level: 2, title: 'Confidant', description: '2 Deep Talks', countType: 'deep', count: 2, healthBonus: 10, rewardStat: 'empathy', rewardPoints: 8 },
  { level: 3, title: 'Brother-in-Arms', description: 'Help 3 times', countType: 'help', count: 3, healthBonus: 15, rewardStat: 'charisma', rewardPoints: 12 },
];
