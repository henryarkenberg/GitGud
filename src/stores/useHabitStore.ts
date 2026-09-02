import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import { HABIT_XP_BASE_DEFAULT, STREAK_FREEZE_WINDOW_DAYS } from '@/constants/rituals';
import { awardXp } from '@/services/progression';
import {
  addLog,
  deleteHabit as deleteHabitRepo,
  getHabitLogs,
  getHabits,
  insertHabit,
  setLogCompleted,
  updateHabit,
} from '@/db/repositories/habitRepo';
import type { Habit, HabitLog, HabitRepeatPattern, StatName } from '@/types';
import { createId, todayISO } from '@/utils/id';
import { computeCurrentStreak, computeLongestStreak, DAY_MS } from '@/utils/rituals';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addHabit: (input: {
    title: string;
    description: string;
    repeatPattern: HabitRepeatPattern;
    relatedStat: StatName;
    baseXp: number;
    color: string;
    icon: string;
  }) => Promise<void>;
  updateHabit: (id: string, patch: Partial<Pick<Habit, 'title' | 'description' | 'repeatPattern' | 'relatedStat' | 'baseXp' | 'color' | 'icon'>>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabit: (id: string) => Promise<void>;
  setArchived: (id: string, archived: boolean) => Promise<void>;
  freezeToday: (id: string) => Promise<boolean>;
}

export const useHabitStore = create<HabitState>()((set, get) => {
  async function recomputeStreaks(habits: Habit[], logs: HabitLog[]): Promise<Habit[]> {
    const today = new Date();
    const completedByHabit = new Map<string, Set<string>>();
    for (const log of logs) {
      if (!log.completed) continue;
      let set = completedByHabit.get(log.habitId);
      if (!set) {
        set = new Set();
        completedByHabit.set(log.habitId, set);
      }
      set.add(log.date);
    }
    const next: Habit[] = [];
    for (const h of habits) {
      const dates = completedByHabit.get(h.id) ?? new Set<string>();
      const streak = computeCurrentStreak(h, dates, today);
      const longest = Math.max(h.longestStreak, computeLongestStreak(h, dates, today));
      if (streak !== h.streak || longest !== h.longestStreak) {
        const updated = { ...h, streak, longestStreak: longest };
        await updateHabit(h.id, { streak, longestStreak: longest });
        next.push(updated);
      } else {
        next.push(h);
      }
    }
    return next;
  }

  return {
    habits: [],
    logs: [],
    hydrated: false,

    hydrate: async () => {
      try {
        const [habits, logs] = await Promise.all([getHabits(), getHabitLogs()]);
        const refreshed = await recomputeStreaks(habits, logs);
        set({ habits: refreshed, logs, hydrated: true });
      } catch (error) {
        console.error('Failed to hydrate habits', error);
        set({ hydrated: true });
      }
    },

    addHabit: async (input) => {
      const habit: Habit = {
        id: createId('habit'),
        title: input.title,
        description: input.description,
        repeatPattern: input.repeatPattern,
        relatedStat: input.relatedStat,
        baseXp: input.baseXp || HABIT_XP_BASE_DEFAULT,
        color: input.color,
        icon: input.icon,
        streak: 0,
        longestStreak: 0,
        isArchived: false,
        lastFreezeDate: null,
        createdAt: new Date().toISOString(),
      };
      await insertHabit(habit);
      const habits = await getHabits();
      set({ habits });
    },

    updateHabit: async (id, patch) => {
      await updateHabit(id, patch);
      await get().hydrate();
    },

    deleteHabit: async (id) => {
      await deleteHabitRepo(id);
      const habits = get().habits.filter((h) => h.id !== id);
      const logs = get().logs.filter((l) => l.habitId !== id);
      set({ habits, logs });
    },

    toggleHabit: async (id) => {
      const today = todayISO();
      const existing = get().logs.find((l) => l.habitId === id && l.date === today);
      const habit = get().habits.find((h) => h.id === id);
      if (!habit) return;
      if (existing && existing.completed) {
        await setLogCompleted(id, today, false, null, 0);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else {
        const bonus = Math.min(habit.streak, 10);
        const xp = habit.baseXp + bonus;
        await addLog({
          id: existing?.id ?? `${today}_${id}`,
          habitId: id,
          date: today,
          completed: true,
          completedAt: new Date().toISOString(),
          xpEarned: xp,
        });
        await setLogCompleted(id, today, true, new Date().toISOString(), xp);
        void awardXp({ module: 'rituals', action: 'habit', entityId: id, xp, statChanges: { [habit.relatedStat]: 1 } });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      const [habits, logs] = await Promise.all([getHabits(), getHabitLogs()]);
      const refreshed = await recomputeStreaks(habits, logs);
      set({ habits: refreshed, logs });
    },

    setArchived: async (id, archived) => {
      await updateHabit(id, { isArchived: archived });
      const habits = await getHabits();
      set({ habits });
    },

    freezeToday: async (id) => {
      const today = todayISO();
      const habit = get().habits.find((h) => h.id === id);
      if (!habit) return false;
      if (habit.lastFreezeDate) {
        const last = new Date(habit.lastFreezeDate).getTime();
        const now = new Date(today).getTime();
        if (now - last < STREAK_FREEZE_WINDOW_DAYS * DAY_MS) return false;
      }
      await updateHabit(id, { lastFreezeDate: today });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      const habits = await getHabits();
      set({ habits });
      return true;
    },
  };
});
