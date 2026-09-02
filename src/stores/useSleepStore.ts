import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import {
  SLEEP_PREPARE_DELAY_MINUTES,
  SLEEP_TARGET_MAX,
  SLEEP_TARGET_MIN,
  SLEEP_TARGET_MINUTES_DEFAULT,
} from '@/constants/sleep';
import { OPTIMAL_SLEEP_MAX, OPTIMAL_SLEEP_MIN, XP_OPTIMAL_SLEEP } from '@/constants/progression';
import { awardXp } from '@/services/progression';
import { getAppState, removeAppState, setAppState } from '@/db/repositories/appStateRepo';
import {
  deleteSession as deleteSleepSession,
  getSessions,
  insertSession as insertSleepSession,
  updateSession as updateSleepSession,
} from '@/db/repositories/sleepRepo';
import type { SleepQuality, SleepSession, SleepSource } from '@/types';
import { createId } from '@/utils/id';
import { computeDebt, durationBetween, isValidISODate, sleepDeficit } from '@/utils/sleep';

const TARGET_KEY = 'sleep_target_minutes';
const ACTIVE_START_KEY = 'sleep_active_start';

interface SleepState {
  sessions: SleepSession[];
  latestSession: SleepSession | null;
  debtMinutes: number;
  targetMinutes: number;
  activeSleepStart: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  prepareForSleep: () => Promise<void>;
  cancelPrepare: () => Promise<void>;
  markAwake: (quality?: SleepQuality) => Promise<void>;
  addManualSession: (input: { sleepStart: string; sleepEnd: string; quality?: SleepQuality }) => Promise<void>;
  updateSession: (id: string, patch: Partial<Pick<SleepSession, 'sleepStart' | 'sleepEnd' | 'quality'>>) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  setQuality: (id: string, quality: SleepQuality) => Promise<void>;
  setTarget: (minutes: number) => Promise<void>;
}

async function readTarget(): Promise<number> {
  const raw = await getAppState(TARGET_KEY);
  if (!raw) return SLEEP_TARGET_MINUTES_DEFAULT;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return SLEEP_TARGET_MINUTES_DEFAULT;
  return Math.min(SLEEP_TARGET_MAX, Math.max(SLEEP_TARGET_MIN, parsed));
}

export const useSleepStore = create<SleepState>()((set, get) => ({
  sessions: [],
  latestSession: null,
  debtMinutes: 0,
  targetMinutes: SLEEP_TARGET_MINUTES_DEFAULT,
  activeSleepStart: null,
  hydrated: false,

  hydrate: async () => {
    const target = await readTarget();
    const sessions = await getSessions();
    const activeSleepStart = (await getAppState(ACTIVE_START_KEY)) || null;
    for (const s of sessions) {
      if (!isValidISODate(s.sleepStart) || !isValidISODate(s.sleepEnd)) {
        await deleteSleepSession(s.id);
        continue;
      }
      const deficit = sleepDeficit(s.durationMinutes, target);
      if (deficit !== s.sleepDebtMinutes) {
        await updateSleepSession(s.id, { sleepDebtMinutes: deficit });
      }
    }
    const refreshed = await getSessions();
    set({
      sessions: refreshed,
      latestSession: refreshed[0] ?? null,
      debtMinutes: computeDebt(refreshed, target),
      targetMinutes: target,
      activeSleepStart,
      hydrated: true,
    });
  },

  prepareForSleep: async () => {
    const start = new Date(Date.now() + SLEEP_PREPARE_DELAY_MINUTES * 60 * 1000).toISOString();
    await setAppState(ACTIVE_START_KEY, start);
    set({ activeSleepStart: start });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  cancelPrepare: async () => {
    await removeAppState(ACTIVE_START_KEY);
    set({ activeSleepStart: null });
  },

  markAwake: async (quality) => {
    const target = get().targetMinutes;
    const active = get().activeSleepStart;
    const now = new Date().toISOString();
    const sleepStart =
      active && isValidISODate(active) ? active : new Date(Date.now() - target * 60 * 1000).toISOString();
    const computed = active && isValidISODate(active) ? durationBetween(sleepStart, now) : target;
    const duration = Number.isFinite(computed) && computed > 0 ? computed : target;
    const session: SleepSession = {
      id: createId('sleep'),
      sleepStart,
      sleepEnd: now,
      durationMinutes: duration,
      quality: quality ?? null,
      sleepDebtMinutes: sleepDeficit(duration, target),
      source: (active && isValidISODate(active) ? 'signal' : 'manual') as SleepSource,
    };
    await insertSleepSession(session);
    await removeAppState(ACTIVE_START_KEY);
    set({ activeSleepStart: null });
    await get().hydrate();
    if (duration >= OPTIMAL_SLEEP_MIN && duration <= OPTIMAL_SLEEP_MAX) {
      void awardXp({ module: 'slumber', action: 'sleep', xp: XP_OPTIMAL_SLEEP, statChanges: { vitality: 2, wisdom: 1 } });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  addManualSession: async ({ sleepStart, sleepEnd, quality }) => {
    const target = get().targetMinutes;
    const computed = durationBetween(sleepStart, sleepEnd);
    const duration = Number.isFinite(computed) && computed > 0 ? computed : target;
    const session: SleepSession = {
      id: createId('sleep'),
      sleepStart,
      sleepEnd,
      durationMinutes: duration,
      quality: quality ?? null,
      sleepDebtMinutes: sleepDeficit(duration, target),
      source: 'manual',
    };
    await insertSleepSession(session);
    await get().hydrate();
  },

  updateSession: async (id, patch) => {
    const sessions = get().sessions;
    const current = sessions.find((s) => s.id === id);
    if (!current) return;
    const next: Partial<SleepSession> = { ...current, ...patch };
    if (patch.sleepStart !== undefined || patch.sleepEnd !== undefined) {
      const computed = durationBetween(
        patch.sleepStart ?? current.sleepStart,
        patch.sleepEnd ?? current.sleepEnd,
      );
      next.durationMinutes = Number.isFinite(computed) && computed > 0 ? computed : current.durationMinutes;
    }
    const debt = sleepDeficit(next.durationMinutes ?? current.durationMinutes, get().targetMinutes);
    await updateSleepSession(id, {
      sleepStart: next.sleepStart,
      sleepEnd: next.sleepEnd,
      durationMinutes: next.durationMinutes,
      quality: next.quality,
      sleepDebtMinutes: debt,
    });
    await get().hydrate();
  },

  deleteSession: async (id) => {
    await deleteSleepSession(id);
    await get().hydrate();
  },

  setQuality: async (id, quality) => {
    await updateSleepSession(id, { quality });
    await get().hydrate();
  },

  setTarget: async (minutes) => {
    const clamped = Math.min(SLEEP_TARGET_MAX, Math.max(SLEEP_TARGET_MIN, minutes));
    await setAppState(TARGET_KEY, String(clamped));
    await get().hydrate();
  },
}));
