import { getDatabase } from '@/db/database';
import type { Objective, ObjectiveDifficulty, ObjectiveStatus, StatName } from '@/types';

interface ObjectiveRow {
  id: string;
  title: string;
  description: string;
  deadline: string | null;
  difficulty: ObjectiveDifficulty;
  status: ObjectiveStatus;
  tags: string;
  related_stat: StatName;
  xp_reward: number;
  created_at: string;
  completed_at: string | null;
  is_generated_by_ai: number;
}

function rowToObjective(row: ObjectiveRow): Objective {
  let tags: string[] = [];
  try {
    tags = JSON.parse(row.tags) as string[];
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    deadline: row.deadline,
    difficulty: row.difficulty,
    status: row.status,
    tags,
    relatedStat: row.related_stat,
    xpReward: row.xp_reward,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    isGeneratedByAI: row.is_generated_by_ai === 1,
  };
}

export async function getObjectives(): Promise<Objective[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ObjectiveRow>('SELECT * FROM objectives ORDER BY created_at DESC');
  return rows.map(rowToObjective);
}

export async function insertObjective(objective: Objective): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO objectives (id, title, description, deadline, difficulty, status, tags, related_stat, xp_reward, created_at, completed_at, is_generated_by_ai)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    objective.id,
    objective.title,
    objective.description,
    objective.deadline,
    objective.difficulty,
    objective.status,
    JSON.stringify(objective.tags),
    objective.relatedStat,
    objective.xpReward,
    objective.createdAt,
    objective.completedAt,
    objective.isGeneratedByAI ? 1 : 0,
  );
}

export async function updateObjective(
  id: string,
  patch: Partial<
    Pick<Objective, 'title' | 'description' | 'deadline' | 'difficulty' | 'status' | 'tags' | 'relatedStat' | 'xpReward' | 'completedAt'>
  >,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (patch.title !== undefined) { assignments.push('title = ?'); values.push(patch.title); }
  if (patch.description !== undefined) { assignments.push('description = ?'); values.push(patch.description); }
  if (patch.deadline !== undefined) { assignments.push('deadline = ?'); values.push(patch.deadline); }
  if (patch.difficulty !== undefined) { assignments.push('difficulty = ?'); values.push(patch.difficulty); }
  if (patch.status !== undefined) { assignments.push('status = ?'); values.push(patch.status); }
  if (patch.tags !== undefined) { assignments.push('tags = ?'); values.push(JSON.stringify(patch.tags)); }
  if (patch.relatedStat !== undefined) { assignments.push('related_stat = ?'); values.push(patch.relatedStat); }
  if (patch.xpReward !== undefined) { assignments.push('xp_reward = ?'); values.push(patch.xpReward); }
  if (patch.completedAt !== undefined) { assignments.push('completed_at = ?'); values.push(patch.completedAt); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE objectives SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteObjective(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM objectives WHERE id = ?', id);
}
