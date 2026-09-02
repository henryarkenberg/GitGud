import { getDatabase } from '@/db/database';
import type { Relation, RelationActivity, RelationActivityType, RelationMilestone, RelationType } from '@/types';

interface RelationRow {
  id: string;
  name: string;
  relation_type: RelationType;
  health: number;
  max_health: number;
  level: number;
  xp: number;
  last_interaction: string | null;
  avatar: string;
  created_at: string;
}

interface ActivityRow {
  id: string;
  relation_id: string;
  type: RelationActivityType;
  duration_minutes: number | null;
  note: string;
  date: string;
  health_restored: number;
  xp_earned: number;
  created_at: string;
}

interface MilestoneRow {
  id: string;
  relation_id: string;
  level: number;
  title: string;
  description: string;
  required_activities: string;
  reward_stat: string;
  reward_points: number;
  is_unlocked: number;
  unlocked_at: string | null;
  created_at: string;
}

function rowToRelation(row: RelationRow): Relation {
  return {
    id: row.id,
    name: row.name,
    relationType: row.relation_type,
    health: row.health,
    maxHealth: row.max_health,
    level: row.level,
    xp: row.xp,
    lastInteraction: row.last_interaction,
    avatar: row.avatar,
    createdAt: row.created_at,
  };
}

function rowToActivity(row: ActivityRow): RelationActivity {
  return {
    id: row.id,
    relationId: row.relation_id,
    type: row.type,
    durationMinutes: row.duration_minutes,
    note: row.note,
    date: row.date,
    healthRestored: row.health_restored,
    xpEarned: row.xp_earned,
  };
}

function rowToMilestone(row: MilestoneRow): RelationMilestone {
  return {
    id: row.id,
    relationId: row.relation_id,
    level: row.level,
    title: row.title,
    description: row.description,
    requiredActivities: row.required_activities,
    rewardStat: row.reward_stat,
    rewardPoints: row.reward_points,
    isUnlocked: row.is_unlocked === 1,
    unlockedAt: row.unlocked_at,
  };
}

export async function getRelations(): Promise<Relation[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RelationRow>('SELECT * FROM relations ORDER BY created_at ASC');
  return rows.map(rowToRelation);
}

export async function insertRelation(relation: Relation): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO relations (id, name, relation_type, health, max_health, level, xp, last_interaction, avatar, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    relation.id,
    relation.name,
    relation.relationType,
    relation.health,
    relation.maxHealth,
    relation.level,
    relation.xp,
    relation.lastInteraction,
    relation.avatar,
    relation.createdAt,
  );
}

export async function updateRelation(
  id: string,
  patch: Partial<Pick<Relation, 'name' | 'relationType' | 'health' | 'maxHealth' | 'level' | 'xp' | 'lastInteraction' | 'avatar'>>,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (patch.name !== undefined) { assignments.push('name = ?'); values.push(patch.name); }
  if (patch.relationType !== undefined) { assignments.push('relation_type = ?'); values.push(patch.relationType); }
  if (patch.health !== undefined) { assignments.push('health = ?'); values.push(patch.health); }
  if (patch.maxHealth !== undefined) { assignments.push('max_health = ?'); values.push(patch.maxHealth); }
  if (patch.level !== undefined) { assignments.push('level = ?'); values.push(patch.level); }
  if (patch.xp !== undefined) { assignments.push('xp = ?'); values.push(patch.xp); }
  if (patch.lastInteraction !== undefined) { assignments.push('last_interaction = ?'); values.push(patch.lastInteraction); }
  if (patch.avatar !== undefined) { assignments.push('avatar = ?'); values.push(patch.avatar); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE relations SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteRelation(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM relations WHERE id = ?', id);
  await db.runAsync('DELETE FROM relation_activities WHERE relation_id = ?', id);
  await db.runAsync('DELETE FROM relation_milestones WHERE relation_id = ?', id);
}

export async function getActivities(): Promise<RelationActivity[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ActivityRow>('SELECT * FROM relation_activities ORDER BY date DESC');
  return rows.map(rowToActivity);
}

export async function insertActivity(activity: RelationActivity): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO relation_activities (id, relation_id, type, duration_minutes, note, date, health_restored, xp_earned, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    activity.id,
    activity.relationId,
    activity.type,
    activity.durationMinutes,
    activity.note,
    activity.date,
    activity.healthRestored,
    activity.xpEarned,
    new Date().toISOString(),
  );
}

export async function deleteActivity(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM relation_activities WHERE id = ?', id);
}

export async function getMilestones(): Promise<RelationMilestone[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<MilestoneRow>('SELECT * FROM relation_milestones ORDER BY level ASC');
  return rows.map(rowToMilestone);
}

export async function insertMilestone(milestone: RelationMilestone): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO relation_milestones (id, relation_id, level, title, description, required_activities, reward_stat, reward_points, is_unlocked, unlocked_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    milestone.id,
    milestone.relationId,
    milestone.level,
    milestone.title,
    milestone.description,
    milestone.requiredActivities,
    milestone.rewardStat,
    milestone.rewardPoints,
    milestone.isUnlocked ? 1 : 0,
    milestone.unlockedAt,
    new Date().toISOString(),
  );
}

export async function updateMilestone(
  id: string,
  patch: Partial<Pick<RelationMilestone, 'isUnlocked' | 'unlockedAt'>>,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (number | string | null)[] = [];
  if (patch.isUnlocked !== undefined) { assignments.push('is_unlocked = ?'); values.push(patch.isUnlocked ? 1 : 0); }
  if (patch.unlockedAt !== undefined) { assignments.push('unlocked_at = ?'); values.push(patch.unlockedAt); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE relation_milestones SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}
