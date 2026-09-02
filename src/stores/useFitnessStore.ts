import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import { EXERCISE_TYPES, MEAL_QUALITY_META } from '@/constants/fitness';
import { exerciseStats } from '@/constants/progression';
import { awardXp } from '@/services/progression';
import {
  deleteExercise as deleteExerciseRepo,
  deleteMeal as deleteMealRepo,
  getDailyFitness,
  getExercises,
  getMeals,
  insertExercise,
  insertMeal,
  setWaterGlasses,
} from '@/db/repositories/fitnessRepo';
import type { DailyFitness, Exercise, ExerciseType, Meal, MealQuality, MealType } from '@/types';
import { createId, todayISO } from '@/utils/id';

interface FitnessState {
  exercises: Exercise[];
  meals: Meal[];
  daily: DailyFitness | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  logExercise: (input: {
    type: ExerciseType;
    subtype: string;
    durationMinutes: number;
    distanceKm?: number | null;
    caloriesBurned?: number | null;
  }) => Promise<void>;
  logMeal: (input: {
    name: string;
    type: MealType;
    quality: MealQuality;
    calories?: number | null;
    protein?: number | null;
    carbs?: number | null;
    fat?: number | null;
  }) => Promise<void>;
  addWater: () => Promise<void>;
  resetWater: () => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
}

export const useFitnessStore = create<FitnessState>()((set, get) => ({
  exercises: [],
  meals: [],
  daily: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [exercises, meals, daily] = await Promise.all([getExercises(), getMeals(), getDailyFitness(todayISO())]);
      set({ exercises, meals, daily, hydrated: true });
    } catch (error) {
      console.error('Failed to hydrate fitness', error);
      set({ hydrated: true });
    }
  },

  logExercise: async ({ type, subtype, durationMinutes, distanceKm = null, caloriesBurned = null }) => {
    const date = todayISO();
    const exercise: Exercise = {
      id: createId('ex'),
      type,
      subtype,
      durationMinutes,
      distanceKm,
      caloriesBurned,
      date,
      xpEarned: EXERCISE_TYPES[type].xp,
      createdAt: new Date().toISOString(),
    };
    await insertExercise(exercise);
    const exercises = await getExercises();
    set({ exercises });
    void awardXp({ module: 'vessel', action: 'exercise', entityId: exercise.id, xp: exercise.xpEarned, statChanges: exerciseStats(type) });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  logMeal: async ({ name, type, quality, calories = null, protein = null, carbs = null, fat = null }) => {
    const date = todayISO();
    const meal: Meal = {
      id: createId('meal'),
      name,
      type,
      calories,
      protein,
      carbs,
      fat,
      quality,
      date,
      xpEarned: MEAL_QUALITY_META[quality].xp,
      createdAt: new Date().toISOString(),
    };
    await insertMeal(meal);
    const meals = await getMeals();
    set({ meals });
    void awardXp({ module: 'vessel', action: 'meal', entityId: meal.id, xp: meal.xpEarned, statChanges: quality === 'clean' ? { vitality: 1 } : {} });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  addWater: async () => {
    const date = todayISO();
    const current = get().daily?.waterGlasses ?? 0;
    const next = current + 1;
    await setWaterGlasses(date, next);
    set({ daily: { date, waterGlasses: next } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  resetWater: async () => {
    const date = todayISO();
    await setWaterGlasses(date, 0);
    set({ daily: { date, waterGlasses: 0 } });
  },

  deleteExercise: async (id) => {
    await deleteExerciseRepo(id);
    const exercises = get().exercises.filter((e) => e.id !== id);
    set({ exercises });
  },

  deleteMeal: async (id) => {
    await deleteMealRepo(id);
    const meals = get().meals.filter((m) => m.id !== id);
    set({ meals });
  },
}));
