import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import { getDailyQuests, setDailyQuestCompleted } from '@/db/repositories/dailyQuestRepo';
import { awardXp } from '@/services/progression';
import {
  buildContext,
  clearEvent,
  generateDailyReport,
  getCachedEvent,
  getCachedReport,
} from '@/services/ai/oracle';
import { useUserStore } from '@/stores/useUserStore';
import type { DailyQuest, DawnReport, RandomEventData } from '@/types';
import { todayISO } from '@/utils/id';

interface OracleState {
  quests: DailyQuest[];
  report: DawnReport | null;
  event: RandomEventData | null;
  loading: boolean;
  initialized: boolean;
  hydrate: () => Promise<void>;
  generateReport: (regenerate?: boolean) => Promise<void>;
  completeQuest: (id: string) => Promise<void>;
  completeEvent: () => Promise<void>;
  dismissEvent: () => Promise<void>;
}

export const useOracleStore = create<OracleState>()((set, get) => ({
  quests: [],
  report: null,
  event: null,
  loading: false,
  initialized: false,

  hydrate: async () => {
    const today = todayISO();
    try {
      const [quests, cached, evt] = await Promise.all([getDailyQuests(today), getCachedReport(), getCachedEvent()]);
      const report = cached?.date === today ? cached.report : null;
      const event = evt && evt.createdAt.slice(0, 10) === today ? evt.event : null;
      set({ quests, report, event, initialized: true });
    } catch (error) {
      console.error('Failed to hydrate oracle', error);
      set({ initialized: true });
    }
  },

  generateReport: async (regenerate = false) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const context = await buildContext();
      const result = await generateDailyReport(context, regenerate);
      set({ report: result.report, quests: result.quests, loading: false });
    } catch (error) {
      console.error('Failed to generate report', error);
      set({ loading: false });
    }
  },

  completeQuest: async (id) => {
    const quest = get().quests.find((q) => q.id === id);
    if (!quest || quest.isCompleted) return;
    await setDailyQuestCompleted(id, new Date().toISOString());
    void awardXp({ module: 'rituals', action: 'daily-quest', entityId: id, xp: quest.xpReward, statChanges: { [quest.relatedStat]: 1 } });
    set({ quests: get().quests.map((q) => (q.id === id ? { ...q, isCompleted: true, completedAt: new Date().toISOString() } : q)) });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  completeEvent: async () => {
    const event = get().event;
    if (!event) return;
    void awardXp({ module: 'rituals', action: 'random-event', entityId: 'event', xp: event.xpReward, statChanges: { [event.statFocus]: 2 } });
    await clearEvent();
    set({ event: null });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  dismissEvent: async () => {
    await clearEvent();
    set({ event: null });
  },
}));

export function hasApiKey(): boolean {
  return !!useUserStore.getState().profile?.aiSettings.apiKey?.trim();
}
