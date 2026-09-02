import {
  Activity,
  Book,
  Brain,
  Code,
  Coffee,
  Droplet,
  Dumbbell,
  Flame,
  Hammer,
  Heart,
  Leaf,
  Moon,
  Music,
  PenLine,
  Rocket,
  Salad,
  Sun,
  Target,
  Waves,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';

import type { ObjectiveDifficulty, ObjectiveStatus } from '@/types';

export const HABIT_COLORS = [
  '#60A5FA',
  '#4ADE80',
  '#FBBF24',
  '#F87171',
  '#A78BFA',
  '#34D399',
  '#F472B6',
  '#FB923C',
];

export const HABIT_ICONS: Record<string, LucideIcon> = {
  book: Book,
  brain: Brain,
  code: Code,
  coffee: Coffee,
  droplet: Droplet,
  dumbbell: Dumbbell,
  flame: Flame,
  hammer: Hammer,
  heart: Heart,
  leaf: Leaf,
  moon: Moon,
  music: Music,
  pen: PenLine,
  rocket: Rocket,
  salad: Salad,
  sun: Sun,
  target: Target,
  walk: Activity,
  waves: Waves,
  wrench: Wrench,
  zap: Zap,
};

export const HABIT_ICON_NAMES = Object.keys(HABIT_ICONS);

export const HABIT_XP_BASE_DEFAULT = 10;

export const STREAK_RENEWAL_DAYS = 3;

export const STREAK_FREEZE_WINDOW_DAYS = 7;

export const OBJECTIVE_DIFFICULTIES: Record<
  ObjectiveDifficulty,
  { label: string; xp: number; tone: 'danger' | 'warning' | 'info' | 'success' | 'accent' }
> = {
  trivial: { label: 'Trivial', xp: 10, tone: 'info' },
  easy: { label: 'Easy', xp: 25, tone: 'info' },
  medium: { label: 'Medium', xp: 50, tone: 'warning' },
  hard: { label: 'Hard', xp: 100, tone: 'danger' },
  epic: { label: 'Epic', xp: 200, tone: 'accent' },
};

export const OBJECTIVE_STATUS_META: Record<ObjectiveStatus, { label: string }> = {
  active: { label: 'Active' },
  completed: { label: 'Completed' },
  failed: { label: 'Failed' },
  abandoned: { label: 'Abandoned' },
};

export const OBJECTIVE_EARLY_BONUS = 0.2;
export const OBJECTIVE_LATE_PENALTY = 0.3;
