import { getDatabase } from '@/db/database';
import type { Habit, HabitLog, HabitRepeatPattern, StatName } from '@/types';

interface HabitRow {
  id: string;
  title: string;
  description: string;
  repeat_pattern: string;
  related_stat: StatName;
  base_xp: number;
  color: string;
  icon: string;
  streak: number;
  longest_streak: number;
  is_archived: number;
  last_freeze_date: string | null;
  created_at: string;
}

interface HabitLogRow {
  id: string;
  habit_id: string;
  date: string;
  completed: number;
  completed_at: string | null;
  xp_earned: number;
}

function parsePattern(raw: string): HabitRepeatPattern {
  try {
    return JSON.parse(raw) as HabitRepeatPattern;
  } catch {
    return { type: 'daily' };
  }
}

function rowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    repeatPattern: parsePattern(row.repeat_pattern),
    relatedStat: row.related_stat,
    baseXp: row.base_xp,
    color: row.color,
    icon: row.icon,
    streak: row.streak,
    longestStreak: row.longest_streak,
    isArchived: row.is_archived === 1,
    lastFreezeDate: row.last_freeze_date,
    createdAt: row.created_at,
  };
}

function rowToLog(row: HabitLogRow): HabitLog {
  return {
    id: row.id,
    habitId: row.habit_id,
    date: row.date,
    completed: row.completed === 1,
    completedAt: row.completed_at,
    xpEarned: row.xp_earned,
  };
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<HabitRow>('SELECT * FROM habits ORDER BY created_at ASC');
  return rows.map(rowToHabit);
}

export async function insertHabit(habit: Habit): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO habits (id, title, description, repeat_pattern, related_stat, base_xp, color, icon, streak, longest_streak, is_archived, last_freeze_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    habit.id,
    habit.title,
    habit.description,
    JSON.stringify(habit.repeatPattern),
    habit.relatedStat,
    habit.baseXp,
    habit.color,
    habit.icon,
    habit.streak,
    habit.longestStreak,
    habit.isArchived ? 1 : 0,
    habit.lastFreezeDate,
    habit.createdAt,
  );
}

export async function updateHabit(
  id: string,
  patch: Partial<
    Pick<Habit, 'title' | 'description' | 'repeatPattern' | 'relatedStat' | 'baseXp' | 'color' | 'icon' | 'streak' | 'longestStreak' | 'isArchived' | 'lastFreezeDate'>
  >,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (patch.title !== undefined) { assignments.push('title = ?'); values.push(patch.title); }
  if (patch.description !== undefined) { assignments.push('description = ?'); values.push(patch.description); }
  if (patch.repeatPattern !== undefined) { assignments.push('repeat_pattern = ?'); values.push(JSON.stringify(patch.repeatPattern)); }
  if (patch.relatedStat !== undefined) { assignments.push('related_stat = ?'); values.push(patch.relatedStat); }
  if (patch.baseXp !== undefined) { assignments.push('base_xp = ?'); values.push(patch.baseXp); }
  if (patch.color !== undefined) { assignments.push('color = ?'); values.push(patch.color); }
  if (patch.icon !== undefined) { assignments.push('icon = ?'); values.push(patch.icon); }
  if (patch.streak !== undefined) { assignments.push('streak = ?'); values.push(patch.streak); }
  if (patch.longestStreak !== undefined) { assignments.push('longest_streak = ?'); values.push(patch.longestStreak); }
  if (patch.isArchived !== undefined) { assignments.push('is_archived = ?'); values.push(patch.isArchived ? 1 : 0); }
  if (patch.lastFreezeDate !== undefined) { assignments.push('last_freeze_date = ?'); values.push(patch.lastFreezeDate); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE habits SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habits WHERE id = ?', id);
  await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ?', id);
}

export async function getHabitLogs(): Promise<HabitLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<HabitLogRow>('SELECT * FROM habit_logs ORDER BY date ASC');
  return rows.map(rowToLog);
}

export async function addLog(log: HabitLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO habit_logs (id, habit_id, date, completed, completed_at, xp_earned)
     VALUES (?, ?, ?, ?, ?, ?)`,
    log.id,
    log.habitId,
    log.date,
    log.completed ? 1 : 0,
    log.completedAt,
    log.xpEarned,
  );
}

export async function setLogCompleted(
  habitId: string,
  date: string,
  completed: boolean,
  completedAt: string | null,
  xpEarned: number,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE habit_logs SET completed = ?, completed_at = ?, xp_earned = ? WHERE habit_id = ? AND date = ?`,
    completed ? 1 : 0,
    completedAt,
    xpEarned,
    habitId,
    date,
  );
}

export async function deleteLog(habitId: string, date: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habit_logs WHERE habit_id = ? AND date = ?', habitId, date);
}
