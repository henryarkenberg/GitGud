import type { ProjectTask, Sprint } from '@/types';
import { isPatternDueOn } from './rituals';

export const SPRINT_XP_PER_25_MIN = 5;

export function sprintElapsedSeconds(sprint: Sprint, now: Date): number {
  if (!sprint.isRunning) return sprint.accumulatedSeconds;
  const segStart = new Date(sprint.startTime).getTime();
  if (Number.isNaN(segStart)) return sprint.accumulatedSeconds;
  return sprint.accumulatedSeconds + Math.max(0, Math.floor((now.getTime() - segStart) / 1000));
}

export function sprintXp(durationMinutes: number): number {
  return Math.floor(durationMinutes / 25) * SPRINT_XP_PER_25_MIN;
}

export function isTaskDueToday(task: ProjectTask, date: Date): boolean {
  if (task.type === 'once') return task.status === 'pending';
  return isPatternDueOn(task.repeatPattern, task.createdAt, date);
}

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
