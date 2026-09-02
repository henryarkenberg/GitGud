import * as Haptics from 'expo-haptics';
import { getAppState, setAppState } from '@/db/repositories/appStateRepo';
import { getHabitLogs, getHabits } from '@/db/repositories/habitRepo';
import { insertLedgerEntry } from '@/db/repositories/ledgerRepo';
import { getObjectives } from '@/db/repositories/objectiveRepo';
import { getPrayersForDate } from '@/db/repositories/prayerRepo';
import {
  DAILY_STREAK_THRESHOLD,
  STAT_CAP,
  XP_PERFECT_DAY,
} from '@/constants/progression';
import { useProgressionStore } from '@/stores/useProgressionStore';
import { useUserStore } from '@/stores/useUserStore';
import type { LedgerEntry, Stats } from '@/types';
import { createId, todayISO } from '@/utils/id';
import { DAY_MS, dayKey, isHabitDueOn } from '@/utils/rituals';
import { levelFromXp, spPerLevel } from '@/utils/xp';

const STREAK_LAST_KEY = 'streak_last_date';
const STREAK_VALUE_KEY = 'streak_value';
const PERFECT_DAY_KEY = 'perfect_day_award';
const SP_SPENT_KEY = 'sp_spent';

export interface AwardInput {
  module: string;
  action: string;
  entityId?: string;
  xp: number;
  statChanges?: Partial<Stats>;
  metadata?: Record<string, unknown>;
}

export interface AwardResult {
  levelUps: number;
  newLevel: number;
  spGained: number;
}

export function cumulativeSp(level: number): number {
  let sp = 0;
  for (let l = 1; l < level; l++) sp += spPerLevel(l);
  return sp;
}

export async function getSpSpent(): Promise<number> {
  const raw = await getAppState(SP_SPENT_KEY);
  const v = raw ? Number.parseInt(raw, 10) : 0;
  return Number.isFinite(v) ? v : 0;
}

async function setSpSpent(value: number): Promise<void> {
  await setAppState(SP_SPENT_KEY, String(value));
}

export async function availableSp(): Promise<number> {
  const store = useUserStore.getState();
  const profile = store.profile;
  if (!profile) return 0;
  const spent = await getSpSpent();
  return Math.max(0, cumulativeSp(levelFromXp(profile.totalXp)) - spent);
}

export async function spendSp(cost: number): Promise<boolean> {
  return serialize(async () => {
    const store = useUserStore.getState();
    const profile = store.profile;
    if (!profile) return false;
    const spent = await getSpSpent();
    const available = Math.max(0, cumulativeSp(levelFromXp(profile.totalXp)) - spent);
    if (available < cost) return false;
    const newSpent = spent + cost;
    await setSpSpent(newSpent);
    await store.patchProfile({ skillPoints: available - cost });
    return true;
  });
}

export async function refundSp(cost: number): Promise<void> {
  return serialize(async () => {
    const store = useUserStore.getState();
    const profile = store.profile;
    if (!profile) return;
    const spent = await getSpSpent();
    const newSpent = Math.max(0, spent - cost);
    await setSpSpent(newSpent);
    const sp = Math.max(0, cumulativeSp(levelFromXp(profile.totalXp)) - newSpent);
    await store.patchProfile({ skillPoints: sp });
  });
}

export async function spendGold(cost: number): Promise<boolean> {
  return serialize(async () => {
    const store = useUserStore.getState();
    const profile = store.profile;
    if (!profile) return false;
    if (profile.gold < cost) return false;
    await store.patchProfile({ gold: profile.gold - cost });
    return true;
  });
}

function capStats(stats: Stats, changes: Partial<Stats> | undefined): Stats {
  if (!changes) return stats;
  const next = { ...stats };
  for (const key of Object.keys(changes) as (keyof Stats)[]) {
    next[key] = Math.min(STAT_CAP, Math.max(0, stats[key] + (changes[key] ?? 0)));
  }
  return next;
}

let progressionChain: Promise<void> = Promise.resolve();

function serialize<T>(op: () => Promise<T>): Promise<T> {
  const run = progressionChain.then(op, op);
  progressionChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function awardXp(input: AwardInput): Promise<AwardResult | null> {
  return serialize(async () => {
  const store = useUserStore.getState();
  const profile = store.profile;
  if (!profile) return null;

  const xp = Math.max(0, Math.round(input.xp));
  const oldLevel = levelFromXp(profile.totalXp);
  const newTotalXp = profile.totalXp + xp;
  const newStats = capStats(profile.stats, input.statChanges);
  const newLevel = levelFromXp(newTotalXp);
  const spent = await getSpSpent();
  const sp = Math.max(0, cumulativeSp(newLevel) - spent);
  const prevSp = profile.skillPoints;

  await store.patchProfile({ totalXp: newTotalXp, stats: newStats, level: newLevel, skillPoints: sp });

  const entry: LedgerEntry = {
    id: createId('ledger'),
    timestamp: new Date().toISOString(),
    module: input.module,
    action: input.action,
    entityId: input.entityId ?? '',
    xpChange: xp,
    statChanges: input.statChanges ?? {},
    metadata: input.metadata ?? {},
  };
  await insertLedgerEntry(entry);

  const levelUps = newLevel - oldLevel;
  if (levelUps > 0) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    useProgressionStore.getState().pushLevelUp({ level: newLevel, spGained: cumulativeSp(newLevel) - cumulativeSp(oldLevel), module: input.module });
  }
  return { levelUps, newLevel, spGained: sp - prevSp };
  });
}

export async function computeDailyScore(dateKey: string): Promise<number> {
  const contributions: number[] = [];

  const prayers = await getPrayersForDate(dateKey);
  if (prayers.length > 0) {
    const done = prayers.filter((p) => p.status === 'on-time' || p.status === 'late').length;
    contributions.push(done / prayers.length);
  }

  const [habits, logs] = await Promise.all([getHabits(), getHabitLogs()]);
  const due = habits.filter((h) => !h.isArchived && isHabitDueOn(h, new Date(`${dateKey}T12:00:00`)));
  if (due.length > 0) {
    const done = due.filter((h) => logs.some((l) => l.habitId === h.id && l.date === dateKey && l.completed)).length;
    contributions.push(done / due.length);
  }

  const objectives = await getObjectives();
  const totalObj = objectives.filter((o) => o.createdAt.slice(0, 10) === dateKey).length;
  if (totalObj > 0) {
    const completed = objectives.filter((o) => o.completedAt && o.completedAt.slice(0, 10) === dateKey).length;
    contributions.push(completed / totalObj);
  }

  if (contributions.length === 0) return 1;
  return contributions.reduce((a, b) => a + b, 0) / contributions.length;
}

export async function updateDailyStreak(): Promise<void> {
  const store = useUserStore.getState();
  const profile = store.profile;
  if (!profile) return;
  const today = todayISO();
  const last = await getAppState(STREAK_LAST_KEY);
  if (last === today) return;
  const yesterday = dayKey(new Date(Date.now() - DAY_MS));

  let streak = profile.currentStreak;
  if (!last) {
    streak = 1;
  } else if (last === yesterday) {
    const score = await computeDailyScore(yesterday);
    streak = score >= DAILY_STREAK_THRESHOLD ? streak + 1 : 0;
  } else {
    streak = 0;
  }
  if (profile.currentStreak > 0 && streak === 0) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  }
  const longest = Math.max(profile.longestStreak, streak);
  await setAppState(STREAK_LAST_KEY, today);
  await setAppState(STREAK_VALUE_KEY, String(streak));
  await store.patchProfile({ currentStreak: streak, longestStreak: longest });
}

export async function checkPerfectDay(): Promise<void> {
  const store = useUserStore.getState();
  if (!store.profile) return;
  const today = todayISO();
  const awarded = await getAppState(PERFECT_DAY_KEY);
  if (awarded === today) return;
  const prayers = await getPrayersForDate(today);
  if (prayers.length === 5 && prayers.every((p) => p.status === 'on-time')) {
    await setAppState(PERFECT_DAY_KEY, today);
    await awardXp({ module: 'sanctum', action: 'perfect-day', xp: XP_PERFECT_DAY, statChanges: { discipline: 2 } });
  }
}

export async function applyDaily(): Promise<void> {
  await updateDailyStreak();
  await checkPerfectDay();
}
