import { getDatabase } from '@/db/database';
import type { NodeRequirement, NodeRewards, SkillNodeType, SkillRarity, SkillTreeNode, StatName } from '@/types';

interface NodeRow {
  id: string;
  name: string;
  description: string;
  node_type: SkillNodeType;
  cost_sp: number;
  requirements: string;
  rewards: string;
  rarity: SkillRarity;
  related_stat: StatName;
  position_x: number;
  position_y: number;
  is_unlocked: number;
  unlocked_at: string | null;
  created_at: string;
}

interface ConnectionRow {
  id: string;
  from_node_id: string;
  to_node_id: string;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function rowToNode(row: NodeRow): SkillTreeNode {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    nodeType: row.node_type,
    costSp: row.cost_sp,
    requirements: parseJson<NodeRequirement>(row.requirements, {}),
    rewards: parseJson<NodeRewards>(row.rewards, {}),
    rarity: row.rarity,
    relatedStat: row.related_stat,
    positionX: row.position_x,
    positionY: row.position_y,
    isUnlocked: row.is_unlocked === 1,
    unlockedAt: row.unlocked_at,
    createdAt: row.created_at,
  };
}

export async function getSkillNodes(): Promise<SkillTreeNode[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<NodeRow>('SELECT * FROM skill_tree_nodes ORDER BY created_at ASC');
  return rows.map(rowToNode);
}

export async function insertSkillNode(node: SkillTreeNode): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO skill_tree_nodes (id, name, description, node_type, cost_sp, requirements, rewards, rarity, related_stat, position_x, position_y, is_unlocked, unlocked_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    node.id,
    node.name,
    node.description,
    node.nodeType,
    node.costSp,
    JSON.stringify(node.requirements),
    JSON.stringify(node.rewards),
    node.rarity,
    node.relatedStat,
    node.positionX,
    node.positionY,
    node.isUnlocked ? 1 : 0,
    node.unlockedAt,
    node.createdAt,
  );
}

export async function updateSkillNode(
  id: string,
  patch: Partial<Pick<SkillTreeNode, 'isUnlocked' | 'unlockedAt' | 'positionX' | 'positionY'>>,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (number | string | null)[] = [];
  if (patch.isUnlocked !== undefined) { assignments.push('is_unlocked = ?'); values.push(patch.isUnlocked ? 1 : 0); }
  if (patch.unlockedAt !== undefined) { assignments.push('unlocked_at = ?'); values.push(patch.unlockedAt); }
  if (patch.positionX !== undefined) { assignments.push('position_x = ?'); values.push(patch.positionX); }
  if (patch.positionY !== undefined) { assignments.push('position_y = ?'); values.push(patch.positionY); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE skill_tree_nodes SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteSkillNode(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM skill_tree_nodes WHERE id = ?', id);
  await db.runAsync('DELETE FROM node_connections WHERE from_node_id = ? OR to_node_id = ?', id, id);
}

export async function getConnections(): Promise<{ id: string; fromNodeId: string; toNodeId: string }[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ConnectionRow>('SELECT * FROM node_connections');
  return rows.map((r) => ({ id: r.id, fromNodeId: r.from_node_id, toNodeId: r.to_node_id }));
}

export async function insertConnection(fromNodeId: string, toNodeId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO node_connections (id, from_node_id, to_node_id) VALUES (?, ?, ?)`,
    `${fromNodeId}_${toNodeId}`,
    fromNodeId,
    toNodeId,
  );
}
