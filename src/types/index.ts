export const STAT_NAMES = [
  'faith',
  'discipline',
  'strength',
  'agility',
  'vitality',
  'wisdom',
  'focus',
  'charisma',
  'empathy',
] as const;

export type StatName = (typeof STAT_NAMES)[number];

export type Stats = Record<StatName, number>;

export type ThemePreference = 'dark' | 'light' | 'system';

export type PrayerMethodId =
  | 'muslim-world-league'
  | 'isna'
  | 'egyptian'
  | 'umm-al-qura'
  | 'karachi'
  | 'dubai'
  | 'moonsighting-committee'
  | 'kuwait'
  | 'qatar'
  | 'singapore'
  | 'turkey'
  | 'tehran'
  | 'jafari';

export type Madhab = 'hanafi' | 'shafi';

export interface PrayerSettings {
  method: PrayerMethodId;
  madhab: Madhab;
  notificationsEnabled: boolean;
  customOffsets?: Partial<Record<string, number>>;
  location?: { latitude: number; longitude: number; label?: string };
}

export const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

export type PrayerName = (typeof PRAYER_NAMES)[number];

export type PrayerStatus = 'pending' | 'on-time' | 'late' | 'missed';

export interface PrayerRecord {
  id: string;
  name: PrayerName;
  date: string;
  scheduledTime: string;
  status: PrayerStatus;
  prayedAt: string | null;
  xpEarned: number;
}

export interface QadaPrayer {
  id: string;
  originalDate: string;
  prayerName: PrayerName;
  prayedAt: string | null;
  xpEarned: number;
}

export interface AISettings {
  apiKey: string;
  model: string;
  dailyReportTime: string;
  enabledModules: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  level: number;
  totalXp: number;
  skillPoints: number;
  gold: number;
  stats: Stats;
  prayerSettings: PrayerSettings;
  aiSettings: AISettings;
  theme: ThemePreference;
  onboardingComplete: boolean;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  entityId: string;
  xpChange: number;
  statChanges: Partial<Stats>;
  metadata: Record<string, unknown>;
}

export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

export type SleepSource = 'signal' | 'manual';

export interface SleepSession {
  id: string;
  sleepStart: string;
  sleepEnd: string;
  durationMinutes: number;
  quality: SleepQuality | null;
  sleepDebtMinutes: number;
  source: SleepSource;
}

export type HabitRepeatPattern =
  | { type: 'daily' }
  | { type: 'weekly'; days: number[] }
  | { type: 'monthly'; dates: number[] }
  | { type: 'interval'; everyDays: number }
  | { type: 'custom'; rule: string };

export interface Habit {
  id: string;
  title: string;
  description: string;
  repeatPattern: HabitRepeatPattern;
  relatedStat: StatName;
  baseXp: number;
  color: string;
  icon: string;
  streak: number;
  longestStreak: number;
  isArchived: boolean;
  lastFreezeDate: string | null;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  completedAt: string | null;
  xpEarned: number;
}

export type ObjectiveDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic';

export type ObjectiveStatus = 'active' | 'completed' | 'failed' | 'abandoned';

export interface Objective {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  difficulty: ObjectiveDifficulty;
  status: ObjectiveStatus;
  tags: string[];
  relatedStat: StatName;
  xpReward: number;
  createdAt: string;
  completedAt: string | null;
  isGeneratedByAI: boolean;
}

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  totalTimeSpentMinutes: number;
  targetHours: number | null;
  relatedStat: StatName;
  createdAt: string;
}

export type ProjectTaskType = 'once' | 'recurring';

export type ProjectTaskStatus = 'pending' | 'done';

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  type: ProjectTaskType;
  repeatPattern: HabitRepeatPattern;
  status: ProjectTaskStatus;
  deadline: string | null;
  xpReward: number;
  lastCompletedDate: string | null;
  createdAt: string;
}

export interface Sprint {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string | null;
  durationMinutes: number;
  note: string;
  isRunning: boolean;
  accumulatedSeconds: number;
  xpEarned: number;
  createdAt: string;
}

export type ExerciseType = 'strength' | 'run' | 'walk' | 'flexibility' | 'sport';

export interface Exercise {
  id: string;
  type: ExerciseType;
  subtype: string;
  durationMinutes: number;
  distanceKm: number | null;
  caloriesBurned: number | null;
  date: string;
  xpEarned: number;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealQuality = 'clean' | 'moderate' | 'indulgent';

export interface Meal {
  id: string;
  name: string;
  type: MealType;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  quality: MealQuality;
  date: string;
  xpEarned: number;
  createdAt: string;
}

export interface DailyFitness {
  date: string;
  waterGlasses: number;
}

export type RelationType = 'family' | 'friend' | 'mentor' | 'colleague' | 'spouse' | 'child' | 'other';

export type RelationActivityType =
  | 'text'
  | 'call'
  | 'meet'
  | 'deep'
  | 'help'
  | 'gift'
  | 'prayed'
  | 'reconcile'
  | 'custom';

export interface Relation {
  id: string;
  name: string;
  relationType: RelationType;
  health: number;
  maxHealth: number;
  level: number;
  xp: number;
  lastInteraction: string | null;
  avatar: string;
  createdAt: string;
}

export interface RelationActivity {
  id: string;
  relationId: string;
  type: RelationActivityType;
  durationMinutes: number | null;
  note: string;
  date: string;
  healthRestored: number;
  xpEarned: number;
}

export interface RelationMilestone {
  id: string;
  relationId: string;
  level: number;
  title: string;
  description: string;
  requiredActivities: string;
  rewardStat: string;
  rewardPoints: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
}

export type DailyQuestCategory = 'prayer' | 'sleep' | 'project' | 'fitness' | 'relation' | 'habit';
export type DailyQuestDifficulty = 'easy' | 'medium' | 'hard';

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  category: DailyQuestCategory;
  difficulty: DailyQuestDifficulty;
  xpReward: number;
  relatedStat: StatName;
  isCompleted: boolean;
  completedAt: string | null;
  generatedByAI: boolean;
  date: string;
}

export interface DawnReport {
  summary: {
    prayer: string;
    sleep: string;
    projects: string;
    fitness: string;
    relations: string;
    habits: string;
  };
  priorities: { urgent: string[]; important: string[]; growth: string[] };
  strategicAdvice: string;
  statFocus: string[];
  flavorText: string;
}

export interface RandomEventData {
  type: string;
  title: string;
  description: string;
  xpReward: number;
  statFocus: StatName;
}

export type SkillNodeType = 'stat' | 'badge' | 'ability' | 'milestone';
export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface NodeRequirement {
  minStat?: StatName;
  minValue?: number;
  activityProof?: string;
}

export interface NodeRewards {
  stats?: Partial<Stats>;
  passive?: string;
  ability?: string;
}

export interface SkillTreeNode {
  id: string;
  name: string;
  description: string;
  nodeType: SkillNodeType;
  costSp: number;
  requirements: NodeRequirement;
  rewards: NodeRewards;
  rarity: SkillRarity;
  relatedStat: StatName;
  positionX: number;
  positionY: number;
  isUnlocked: boolean;
  unlockedAt: string | null;
  createdAt: string;
}

export interface NodeOption {
  id: string;
  name: string;
  description: string;
  nodeType: SkillNodeType;
  rarity: SkillRarity;
  relatedStat: StatName;
  costSp: number;
  rewards: NodeRewards;
  requirements: NodeRequirement;
}

export type DashboardModuleId =
  | 'sanctum'
  | 'slumber'
  | 'forge'
  | 'rituals'
  | 'vessel'
  | 'covenant'
  | 'aetherium';