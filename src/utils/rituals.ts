import { OBJECTIVE_EARLY_BONUS, OBJECTIVE_LATE_PENALTY, STREAK_RENEWAL_DAYS } from '@/constants/rituals';
import type { Habit, HabitRepeatPattern, Objective } from '@/types';

export const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function isHabitDueOn(habit: Habit, date: Date): boolean {
  return isPatternDueOn(habit.repeatPattern, habit.createdAt, date);
}

export function isPatternDueOn(pattern: HabitRepeatPattern, createdAt: string, date: Date): boolean {
  const d = new Date(date);
  switch (pattern.type) {
    case 'daily':
      return true;
    case 'weekly':
      return pattern.days.includes(d.getDay());
    case 'monthly':
      return pattern.dates.includes(d.getDate());
    case 'interval': {
      const created = new Date(createdAt);
      if (Number.isNaN(created.getTime())) return true;
      const span = Math.floor((dayKeyStart(date) - dayKeyStart(created)) / DAY_MS);
      if (span < 0) return false;
      return span % Math.max(1, pattern.everyDays) === 0;
    }
    case 'custom':
      return matchesCustomRule(pattern.rule, d);
  }
}

function dayKeyStart(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function matchesCustomRule(rule: string, d: Date): boolean {
  const trimmed = rule.trim();
  if (trimmed.startsWith('every:')) {
    const n = Number.parseInt(trimmed.slice(6), 10);
    if (!Number.isFinite(n) || n <= 0) return true;
    return d.getDate() % n === 1;
  }
  if (trimmed.startsWith('dow:')) {
    const list = trimmed
      .slice(4)
      .split(',')
      .map((s) => s.trim().toLowerCase());
    const name = DAY_NAMES[d.getDay()].toLowerCase();
    return list.includes(name);
  }
  return true;
}

export function formatRepeatPattern(pattern: HabitRepeatPattern): string {
  switch (pattern.type) {
    case 'daily':
      return 'Every day';
    case 'weekly':
      return pattern.days.map((d) => DAY_NAMES[d]).join(', ');
    case 'monthly':
      return `Monthly (${pattern.dates.map((n) => ordinal(n)).join(', ')})`;
    case 'interval':
      return `Every ${pattern.everyDays} days`;
    case 'custom':
      return 'Custom';
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export function computeCurrentStreak(
  habit: Habit,
  completedDates: Set<string>,
  today: Date,
  maxDays = 730,
): number {
  let streak = 0;
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < maxDays; i++) {
    const key = dayKey(d);
    const due = isHabitDueOn(habit, d);
    const completed = completedDates.has(key);
    if (due) {
      if (completed) {
        streak++;
      } else if (i !== 0 && habit.lastFreezeDate !== key) {
        break;
      }
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function computeLongestStreak(
  habit: Habit,
  completedDates: Set<string>,
  today: Date,
  maxDays = 730,
): number {
  let longest = 0;
  let run = 0;
  const d = new Date(today);
  d.setHours(0, 0, 0, 0);
  for (let i = 0; i < maxDays; i++) {
    const key = dayKey(d);
    const due = isHabitDueOn(habit, d);
    if (due) {
      if (completedDates.has(key)) {
        run++;
        if (run > longest) longest = run;
      } else if (i !== 0 && habit.lastFreezeDate !== key) {
        run = 0;
      }
    }
    d.setDate(d.getDate() - 1);
  }
  return longest;
}

export function isHabitFractured(habit: Habit, hasHistory: boolean, streak: number): boolean {
  return hasHistory && streak < STREAK_RENEWAL_DAYS;
}

export function objectiveXpAward(objective: Objective, completedAt: Date): number {
  const base = objective.xpReward;
  if (!objective.deadline) return base;
  const deadline = new Date(objective.deadline);
  if (Number.isNaN(deadline.getTime())) return base;
  const earlyThreshold = deadline.getTime() - 24 * 60 * 60 * 1000;
  if (completedAt.getTime() <= earlyThreshold) {
    return Math.round(base * (1 + OBJECTIVE_EARLY_BONUS));
  }
  if (completedAt.getTime() > deadline.getTime()) {
    return Math.round(base * (1 - OBJECTIVE_LATE_PENALTY));
  }
  return base;
}
