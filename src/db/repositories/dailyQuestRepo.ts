import { getDatabase } from '@/db/database';
import type { DailyQuest, DailyQuestCategory, DailyQuestDifficulty, StatName } from '@/types';

interface DailyQuestRow {
  id: string;
  title: string;
  description: string;
  category: DailyQuestCategory;
  difficulty: DailyQuestDifficulty;
  xp_reward: number;
  related_stat: StatName;
  is_completed: number;
  completed_at: string | null;
  generated_by_ai: number;
  date: string;
}

function rowToQuest(row: DailyQuestRow): DailyQuest {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    difficulty: row.difficulty,
    xpReward: row.xp_reward,
    relatedStat: row.related_stat,
    isCompleted: row.is_completed === 1,
    completedAt: row.completed_at,
    generatedByAI: row.generated_by_ai === 1,
    date: row.date,
  };
}

export async function getDailyQuests(date: string): Promise<DailyQuest[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DailyQuestRow>(
    'SELECT * FROM daily_quests WHERE date = ? ORDER BY rowid ASC',
    date,
  );
  return rows.map(rowToQuest);
}

export async function insertDailyQuest(quest: DailyQuest): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO daily_quests (id, title, description, category, difficulty, xp_reward, related_stat, is_completed, completed_at, generated_by_ai, date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    quest.id,
    quest.title,
    quest.description,
    quest.category,
    quest.difficulty,
    quest.xpReward,
    quest.relatedStat,
    quest.isCompleted ? 1 : 0,
    quest.completedAt,
    quest.generatedByAI ? 1 : 0,
    quest.date,
  );
}

export async function setDailyQuestCompleted(id: string, completedAt: string | null): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE daily_quests SET is_completed = ?, completed_at = ? WHERE id = ?',
    completedAt ? 1 : 0,
    completedAt,
    id,
  );
}

export async function deleteDailyQuestsForDate(date: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM daily_quests WHERE date = ?', date);
}
