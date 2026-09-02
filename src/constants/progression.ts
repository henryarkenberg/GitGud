import type { ExerciseType, RelationActivityType, Stats } from '@/types';

export const STAT_CAP = 100;

export const XP_PERFECT_DAY = 100;
export const XP_OPTIMAL_SLEEP = 40;

export const OPTIMAL_SLEEP_MIN = 450;
export const OPTIMAL_SLEEP_MAX = 540;

export const DAILY_STREAK_THRESHOLD = 0.8;

export const MODULE_LABELS: Record<string, string> = {
  sanctum: 'Sanctum',
  slumber: 'Slumber',
  rituals: 'Rituals',
  forge: 'Forge',
  vessel: 'Vessel',
  covenant: 'Covenant',
};

export function exerciseStats(type: ExerciseType): Partial<Stats> {
  switch (type) {
    case 'strength':
      return { strength: 2, vitality: 1 };
    case 'run':
      return { agility: 2, vitality: 1 };
    case 'walk':
      return { agility: 1 };
    case 'flexibility':
      return { agility: 1 };
    case 'sport':
      return { strength: 2, agility: 1 };
  }
}

export function relationStats(type: RelationActivityType): Partial<Stats> {
  switch (type) {
    case 'text':
      return { empathy: 1 };
    case 'call':
      return { empathy: 1, charisma: 1 };
    case 'meet':
      return { charisma: 2, empathy: 1 };
    case 'deep':
      return { empathy: 2 };
    case 'help':
      return { charisma: 2 };
    case 'gift':
      return { charisma: 1 };
    case 'prayed':
      return { faith: 2, empathy: 1 };
    case 'reconcile':
      return { empathy: 2 };
    case 'custom':
      return {};
  }
}
