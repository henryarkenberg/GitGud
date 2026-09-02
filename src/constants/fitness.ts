import type { ExerciseType, MealQuality, MealType } from '@/types';

export const WATER_GOAL = 8;

export const EXERCISE_TYPES: Record<ExerciseType, { label: string; xp: number }> = {
  strength: { label: 'Strength', xp: 10 },
  run: { label: 'Cardio · Run', xp: 20 },
  walk: { label: 'Cardio · Walk', xp: 8 },
  flexibility: { label: 'Flexibility', xp: 6 },
  sport: { label: 'Sport', xp: 15 },
};

export const EXERCISE_SUBTYPES: Record<ExerciseType, string[]> = {
  strength: ['Bench press', 'Squat', 'Deadlift', 'Overhead press', 'Rows', 'Pushups', 'Pullups'],
  run: ['5k run', '10k run', 'Tempo run', 'Interval run'],
  walk: ['Brisk walk', 'Hike'],
  flexibility: ['Yoga', 'Stretching', 'Mobility'],
  sport: ['Basketball', 'Football (soccer)', 'Tennis', 'Swimming', 'Gym / play'],
};

export const EXERCISE_TYPES_LIST = Object.keys(EXERCISE_TYPES) as ExerciseType[];

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_OPTIONS: Record<MealType, string[]> = {
  breakfast: ['Oatmeal & fruit', 'Eggs & toast', 'Smoothie', 'Yogurt & granola'],
  lunch: ['Salad & chicken', 'Rice & curry', 'Sandwich', 'Leftovers'],
  dinner: ['Grilled vegetables', 'Pasta', 'Soup', 'Rice & legumes'],
  snack: ['Fruit', 'Nuts', 'Dates', 'Protein bar'],
};

export const MEAL_QUALITY_META: Record<MealQuality, { label: string; xp: number; tone: 'success' | 'warning' | 'danger' }> = {
  clean: { label: 'Clean', xp: 10, tone: 'success' },
  moderate: { label: 'Moderate', xp: 4, tone: 'warning' },
  indulgent: { label: 'Indulgent', xp: 0, tone: 'danger' },
};

export const MEAL_OPTION_QUALITY: Record<MealQuality, string[]> = {
  clean: ['Oatmeal & fruit', 'Eggs & toast', 'Smoothie', 'Yogurt & granola', 'Salad & chicken', 'Grilled vegetables', 'Rice & legumes', 'Fruit', 'Nuts', 'Dates'],
  moderate: ['Rice & curry', 'Sandwich', 'Leftovers', 'Soup', 'Pasta', 'Protein bar', 'Lunch', 'Dinner'],
  indulgent: ['Pizza', 'Burger', 'Sweets', 'Soda'],
};
