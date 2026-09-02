import { getDatabase } from '@/db/database';
import type { HabitRepeatPattern, Project, ProjectStatus, ProjectTask, ProjectTaskType, ProjectTaskStatus, Sprint, StatName } from '@/types';

interface ProjectRow {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status: ProjectStatus;
  total_time_spent_minutes: number;
  target_hours: number | null;
  related_stat: StatName;
  created_at: string;
}

interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  type: ProjectTaskType;
  repeat_pattern: string | null;
  status: ProjectTaskStatus;
  deadline: string | null;
  xp_reward: number;
  last_completed_date: string | null;
  created_at: string;
}

interface SprintRow {
  id: string;
  project_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number;
  note: string;
  is_running: number;
  accumulated_seconds: number;
  xp_earned: number;
  created_at: string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: row.color,
    icon: row.icon,
    status: row.status,
    totalTimeSpentMinutes: row.total_time_spent_minutes,
    targetHours: row.target_hours,
    relatedStat: row.related_stat,
    createdAt: row.created_at,
  };
}

function parsePattern(raw: string | null): HabitRepeatPattern {
  if (!raw) return { type: 'daily' };
  try {
    return JSON.parse(raw) as HabitRepeatPattern;
  } catch {
    return { type: 'daily' };
  }
}

function rowToTask(row: TaskRow): ProjectTask {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    type: row.type,
    repeatPattern: parsePattern(row.repeat_pattern),
    status: row.status,
    deadline: row.deadline,
    xpReward: row.xp_reward,
    lastCompletedDate: row.last_completed_date,
    createdAt: row.created_at,
  };
}

function rowToSprint(row: SprintRow): Sprint {
  return {
    id: row.id,
    projectId: row.project_id,
    startTime: row.start_time,
    endTime: row.end_time,
    durationMinutes: row.duration_minutes,
    note: row.note,
    isRunning: row.is_running === 1,
    accumulatedSeconds: row.accumulated_seconds,
    xpEarned: row.xp_earned,
    createdAt: row.created_at,
  };
}

export async function getProjects(): Promise<Project[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProjectRow>('SELECT * FROM projects ORDER BY created_at ASC');
  return rows.map(rowToProject);
}

export async function insertProject(project: Project): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO projects (id, name, description, color, icon, status, total_time_spent_minutes, target_hours, related_stat, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    project.id,
    project.name,
    project.description,
    project.color,
    project.icon,
    project.status,
    project.totalTimeSpentMinutes,
    project.targetHours,
    project.relatedStat,
    project.createdAt,
  );
}

export async function updateProject(
  id: string,
  patch: Partial<Pick<Project, 'name' | 'description' | 'color' | 'icon' | 'status' | 'totalTimeSpentMinutes' | 'targetHours' | 'relatedStat'>>,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (patch.name !== undefined) { assignments.push('name = ?'); values.push(patch.name); }
  if (patch.description !== undefined) { assignments.push('description = ?'); values.push(patch.description); }
  if (patch.color !== undefined) { assignments.push('color = ?'); values.push(patch.color); }
  if (patch.icon !== undefined) { assignments.push('icon = ?'); values.push(patch.icon); }
  if (patch.status !== undefined) { assignments.push('status = ?'); values.push(patch.status); }
  if (patch.totalTimeSpentMinutes !== undefined) { assignments.push('total_time_spent_minutes = ?'); values.push(patch.totalTimeSpentMinutes); }
  if (patch.targetHours !== undefined) { assignments.push('target_hours = ?'); values.push(patch.targetHours); }
  if (patch.relatedStat !== undefined) { assignments.push('related_stat = ?'); values.push(patch.relatedStat); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE projects SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM projects WHERE id = ?', id);
  await db.runAsync('DELETE FROM project_tasks WHERE project_id = ?', id);
  await db.runAsync('DELETE FROM sprints WHERE project_id = ?', id);
}

export async function getTasks(): Promise<ProjectTask[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TaskRow>('SELECT * FROM project_tasks ORDER BY created_at ASC');
  return rows.map(rowToTask);
}

export async function insertTask(task: ProjectTask): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO project_tasks (id, project_id, title, type, repeat_pattern, status, deadline, xp_reward, last_completed_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    task.id,
    task.projectId,
    task.title,
    task.type,
    JSON.stringify(task.repeatPattern),
    task.status,
    task.deadline,
    task.xpReward,
    task.lastCompletedDate,
    task.createdAt,
  );
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<ProjectTask, 'title' | 'status' | 'deadline' | 'xpReward' | 'type' | 'repeatPattern' | 'lastCompletedDate'>>,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (patch.title !== undefined) { assignments.push('title = ?'); values.push(patch.title); }
  if (patch.status !== undefined) { assignments.push('status = ?'); values.push(patch.status); }
  if (patch.deadline !== undefined) { assignments.push('deadline = ?'); values.push(patch.deadline); }
  if (patch.xpReward !== undefined) { assignments.push('xp_reward = ?'); values.push(patch.xpReward); }
  if (patch.type !== undefined) { assignments.push('type = ?'); values.push(patch.type); }
  if (patch.repeatPattern !== undefined) { assignments.push('repeat_pattern = ?'); values.push(JSON.stringify(patch.repeatPattern)); }
  if (patch.lastCompletedDate !== undefined) { assignments.push('last_completed_date = ?'); values.push(patch.lastCompletedDate); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE project_tasks SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM project_tasks WHERE id = ?', id);
}

export async function getSprints(): Promise<Sprint[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SprintRow>('SELECT * FROM sprints ORDER BY start_time DESC');
  return rows.map(rowToSprint);
}

export async function insertSprint(sprint: Sprint): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sprints (id, project_id, start_time, end_time, duration_minutes, note, is_running, accumulated_seconds, xp_earned, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    sprint.id,
    sprint.projectId,
    sprint.startTime,
    sprint.endTime,
    sprint.durationMinutes,
    sprint.note,
    sprint.isRunning ? 1 : 0,
    sprint.accumulatedSeconds,
    sprint.xpEarned,
    sprint.createdAt,
  );
}

export async function updateSprint(
  id: string,
  patch: Partial<Pick<Sprint, 'startTime' | 'endTime' | 'durationMinutes' | 'note' | 'isRunning' | 'accumulatedSeconds' | 'xpEarned'>>,
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (patch.startTime !== undefined) { assignments.push('start_time = ?'); values.push(patch.startTime); }
  if (patch.endTime !== undefined) { assignments.push('end_time = ?'); values.push(patch.endTime); }
  if (patch.durationMinutes !== undefined) { assignments.push('duration_minutes = ?'); values.push(patch.durationMinutes); }
  if (patch.note !== undefined) { assignments.push('note = ?'); values.push(patch.note); }
  if (patch.isRunning !== undefined) { assignments.push('is_running = ?'); values.push(patch.isRunning ? 1 : 0); }
  if (patch.accumulatedSeconds !== undefined) { assignments.push('accumulated_seconds = ?'); values.push(patch.accumulatedSeconds); }
  if (patch.xpEarned !== undefined) { assignments.push('xp_earned = ?'); values.push(patch.xpEarned); }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE sprints SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteSprint(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sprints WHERE id = ?', id);
}
