import * as Haptics from 'expo-haptics';
import { create } from 'zustand';

import { XP_PRAYER_LATE, XP_PRAYER_ON_TIME, XP_PRAYER_QADA } from '@/constants/prayers';
import { awardXp } from '@/services/progression';
import {
  addQadaPrayer,
  completeAllQada,
  ensurePrayerRow,
  getPendingPrayersBefore,
  getPrayersForDate,
  getQadaFor,
  getQadaQueue,
  markQadaPrayed,
  removeQadaPrayer,
  setQadaUnprayed,
  updatePrayer,
} from '@/db/repositories/prayerRepo';
import type { PrayerName, PrayerRecord, QadaPrayer } from '@/types';
import { createId, todayISO } from '@/utils/id';
import { prayerSlotsFor, windowEndFor, type PrayerTimesMap } from '@/utils/prayerTimes';

export const UNDO_WINDOW_MS = 5 * 60 * 1000;

interface LastAction {
  name: PrayerName;
  action: 'prayed' | 'missed';
  at: number;
}

interface PrayerState {
  records: PrayerRecord[];
  qada: QadaPrayer[];
  lastAction: LastAction | null;
  hydrated: boolean;
  hydrate: (times: PrayerTimesMap | null) => Promise<void>;
  markPrayed: (name: PrayerName, times: PrayerTimesMap) => Promise<void>;
  markMissed: (name: PrayerName) => Promise<void>;
  undo: () => Promise<void>;
  completeQada: (id: string) => Promise<void>;
  completeAllQada: () => Promise<void>;
  unpray: (name: PrayerName) => Promise<void>;
  reconcile: (times: PrayerTimesMap) => Promise<void>;
}

function statusFromTimes(name: PrayerName, times: PrayerTimesMap): 'on-time' | 'late' {
  return new Date().getTime() <= windowEndFor(name, times).getTime() ? 'on-time' : 'late';
}

export const usePrayerStore = create<PrayerState>()((set, get) => ({
  records: [],
  qada: [],
  lastAction: null,
  hydrated: false,

  hydrate: async (times) => {
    const date = todayISO();
    try {
      if (times) {
        for (const slot of prayerSlotsFor(times)) {
          await ensurePrayerRow({
            id: `${date}_${slot.name}`,
            name: slot.name,
            date,
            scheduledTime: slot.time.toISOString(),
            status: 'pending',
            prayedAt: null,
            xpEarned: 0,
          });
        }
      }
      const overdue = await getPendingPrayersBefore(date);
      for (const p of overdue) {
        await updatePrayer(p.name, p.date, { status: 'missed', prayedAt: null, xpEarned: 0 });
        await addQadaPrayer(p.date, p.name, createId('qada'));
      }
      const records = await getPrayersForDate(date);
      const qada = await getQadaQueue();
      set({ records, qada, hydrated: true });
    } catch (error) {
      console.error('Failed to hydrate prayers', error);
      set({ hydrated: true });
    }
  },

  markPrayed: async (name, times) => {
    const date = todayISO();
    const now = new Date();
    const status = statusFromTimes(name, times);
    const xpEarned = status === 'on-time' ? XP_PRAYER_ON_TIME : XP_PRAYER_LATE;
    await updatePrayer(name, date, { status, prayedAt: now.toISOString(), xpEarned });
    set({
      records: get().records.map((r) =>
        r.name === name ? { ...r, status, prayedAt: now.toISOString(), xpEarned } : r,
      ),
      lastAction: { name, action: 'prayed', at: Date.now() },
    });
    void awardXp({ module: 'sanctum', action: 'prayer', entityId: name, xp: xpEarned, statChanges: { faith: status === 'on-time' ? 2 : 1 } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  },

  markMissed: async (name) => {
    const date = todayISO();
    await updatePrayer(name, date, { status: 'missed', prayedAt: null, xpEarned: 0 });
    await addQadaPrayer(date, name, createId('qada'));
    const qada = await getQadaQueue();
    set({
      records: get().records.map((r) => (r.name === name ? { ...r, status: 'missed' as const, prayedAt: null, xpEarned: 0 } : r)),
      qada,
      lastAction: { name, action: 'missed', at: Date.now() },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
  },

  undo: async () => {
    const { lastAction } = get();
    if (!lastAction || Date.now() - lastAction.at > UNDO_WINDOW_MS) return;
    const date = todayISO();
    await updatePrayer(lastAction.name, date, { status: 'pending', prayedAt: null, xpEarned: 0 });
    if (lastAction.action === 'missed') {
      await removeQadaPrayer(date, lastAction.name);
    }
    const [records, qada] = await Promise.all([getPrayersForDate(date), getQadaQueue()]);
    set({ records, qada, lastAction: null });
  },

  completeQada: async (id) => {
    const q = get().qada.find((x) => x.id === id);
    const now = new Date().toISOString();
    await markQadaPrayed(id, now, XP_PRAYER_QADA);
    if (q) {
      await updatePrayer(q.prayerName, q.originalDate, { status: 'late', prayedAt: now, xpEarned: XP_PRAYER_QADA });
    }
    const [records, qada] = await Promise.all([getPrayersForDate(todayISO()), getQadaQueue()]);
    set({ records, qada });
    void awardXp({ module: 'sanctum', action: 'qada', entityId: id, xp: XP_PRAYER_QADA, statChanges: { faith: 1 } });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  unpray: async (name) => {
    const date = todayISO();
    const q = await getQadaFor(date, name);
    if (q) {
      if (q.prayedAt) await setQadaUnprayed(q.id);
      await updatePrayer(name, date, { status: 'missed', prayedAt: null, xpEarned: 0 });
    } else {
      await updatePrayer(name, date, { status: 'pending', prayedAt: null, xpEarned: 0 });
    }
    const [records, qada] = await Promise.all([getPrayersForDate(date), getQadaQueue()]);
    set({ records, qada });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },

  completeAllQada: async () => {
    const count = get().qada.length;
    await completeAllQada(new Date().toISOString(), XP_PRAYER_QADA);
    const qada = await getQadaQueue();
    set({ qada });
    if (count > 0) {
      void awardXp({ module: 'sanctum', action: 'qada-all', entityId: 'all', xp: XP_PRAYER_QADA * count, statChanges: { faith: count } });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },

  reconcile: async (times) => {
    const date = todayISO();
    const now = Date.now();
    const overdue = get().records.filter(
      (r) => r.status === 'pending' && windowEndFor(r.name, times).getTime() < now,
    );
    if (overdue.length === 0) return;
    for (const r of overdue) {
      await updatePrayer(r.name, date, { status: 'missed', prayedAt: null, xpEarned: 0 });
      await addQadaPrayer(date, r.name, createId('qada'));
    }
    const [records, qada] = await Promise.all([getPrayersForDate(date), getQadaQueue()]);
    set({ records, qada });
  },
}));