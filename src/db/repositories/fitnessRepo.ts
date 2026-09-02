import { getDatabase } from '@/db/database';
import type { DailyFitness, Exercise, ExerciseType, Meal, MealQuality, MealType } from '@/types';

interface ExerciseRow {
  id: string;
  type: ExerciseType;
  subtype: string;
  duration_minutes: number;
  distance_km: number | null;
  calories_burned: number | null;
  date: string;
  xp_earned: number;
  created_at: string;
}

interface MealRow {
  id: string;
  name: string;
  type: MealType;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  quality: MealQuality;
  date: string;
  xp_earned: number;
  created_at: string;
}

interface FitnessRow {
  date: string;
  water_glasses: number;
}

function rowToExercise(row: ExerciseRow): Exercise {
  return {
    id: row.id,
    type: row.type,
    subtype: row.subtype,
    durationMinutes: row.duration_minutes,
    distanceKm: row.distance_km,
    caloriesBurned: row.calories_burned,
    date: row.date,
    xpEarned: row.xp_earned,
    createdAt: row.created_at,
  };
}

function rowToMeal(row: MealRow): Meal {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    calories: row.calories,
    protein: row.protein,
    carbs: row.carbs,
    fat: row.fat,
    quality: row.quality,
    date: row.date,
    xpEarned: row.xp_earned,
    createdAt: row.created_at,
  };
}

function rowToDaily(row: FitnessRow): DailyFitness {
  return { date: row.date, waterGlasses: row.water_glasses };
}

export async function getExercises(): Promise<Exercise[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ExerciseRow>('SELECT * FROM exercises ORDER BY created_at DESC');
  return rows.map(rowToExercise);
}

export async function insertExercise(exercise: Exercise): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO exercises (id, type, subtype, duration_minutes, distance_km, calories_burned, date, xp_earned, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    exercise.id,
    exercise.type,
    exercise.subtype,
    exercise.durationMinutes,
    exercise.distanceKm,
    exercise.caloriesBurned,
    exercise.date,
    exercise.xpEarned,
    exercise.createdAt,
  );
}

export async function deleteExercise(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM exercises WHERE id = ?', id);
}

export async function getMeals(): Promise<Meal[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MealRow>('SELECT * FROM meals ORDER BY created_at DESC');
  return rows.map(rowToMeal);
}

export async function insertMeal(meal: Meal): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO meals (id, name, type, calories, protein, carbs, fat, quality, date, xp_earned, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    meal.id,
    meal.name,
    meal.type,
    meal.calories,
    meal.protein,
    meal.carbs,
    meal.fat,
    meal.quality,
    meal.date,
    meal.xpEarned,
    meal.createdAt,
  );
}

export async function deleteMeal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM meals WHERE id = ?', id);
}

export async function getDailyFitness(date: string): Promise<DailyFitness | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<FitnessRow>('SELECT * FROM daily_fitness WHERE date = ?', date);
  return row ? rowToDaily(row) : null;
}

export async function setWaterGlasses(date: string, glasses: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO daily_fitness (date, water_glasses) VALUES (?, ?)
     ON CONFLICT(date) DO UPDATE SET water_glasses = excluded.water_glasses`,
    date,
    glasses,
  );
}
