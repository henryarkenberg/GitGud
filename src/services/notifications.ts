import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  NOTIFICATION_CATEGORY_PRAYER,
  PRAYER_ACTION_PRAYED,
  PRAYER_ACTION_SNOOZE,
  PRAYER_NOTIFICATION_MINUTES_BEFORE,
} from '@/constants/prayers';
import { getAppState, setAppState } from '@/db/repositories/appStateRepo';
import type { PrayerName } from '@/types';
import { formatPrayerTime, type PrayerTimesMap } from '@/utils/prayerTimes';

const SCHEDULED_IDS_KEY = 'prayer_notification_ids';
const SCHEDULE_DAYS_AHEAD = 3;

const CAT_STREAK = 'streak';
const CAT_RELATION = 'relation';
const CAT_REPORT = 'report';
const CAT_SPRINT = 'sprint';

export interface PrayerNotificationData extends Record<string, unknown> {
  prayer: PrayerName;
  date: string;
}

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let loadPromise: Promise<NotificationsModule | null> | null = null;

function isExpoGoAndroid(): boolean {
  return Platform.OS === 'android' && Constants.appOwnership === 'expo';
}

export function notificationsSupported(): boolean {
  return !isExpoGoAndroid();
}

async function getNotifications(): Promise<NotificationsModule | null> {
  if (!notificationsSupported()) return null;
  if (notificationsModule) return notificationsModule;
  if (!loadPromise) {
    loadPromise = import('expo-notifications')
      .then((m) => {
        notificationsModule = m;
        return m;
      })
      .catch(() => null);
  }
  return loadPromise;
}

function minutesBefore(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60 * 1000);
}

export async function configureNotifications(): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('prayer', {
      name: 'Prayer Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
    });
  }

  await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORY_PRAYER, [
    {
      identifier: PRAYER_ACTION_PRAYED,
      buttonTitle: 'Prayed',
      options: { opensAppToForeground: false },
    },
    {
      identifier: PRAYER_ACTION_SNOOZE,
      buttonTitle: 'Snooze',
      options: { opensAppToForeground: false },
    },
  ]);
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelScheduledPrayerNotifications(): Promise<void> {
  const raw = await getAppState(SCHEDULED_IDS_KEY);
  if (raw) {
    try {
      const ids: string[] = JSON.parse(raw);
      const Notifications = await getNotifications();
      for (const id of ids) {
        await Notifications?.cancelScheduledNotificationAsync(id).catch(() => {});
      }
    } catch {
      // ignore malformed ids
    }
  }
  await setAppState(SCHEDULED_IDS_KEY, '[]');
}

export async function schedulePrayerNotifications(
  times: PrayerTimesMap,
  enabled: boolean,
  getDayTimes: (date: Date) => PrayerTimesMap,
): Promise<void> {
  if (!enabled) {
    await cancelScheduledPrayerNotifications();
    return;
  }
  const Notifications = await getNotifications();
  if (!Notifications) {
    await cancelScheduledPrayerNotifications();
    return;
  }
  const permitted = await ensureNotificationPermission();
  if (!permitted) return;

  await cancelScheduledPrayerNotifications();

  const names: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const ids: string[] = [];
  const now = Date.now();

  for (let day = 0; day < SCHEDULE_DAYS_AHEAD; day++) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + day);
    const dayTimes = day === 0 ? times : getDayTimes(dayDate);
    for (const name of names) {
      const prayerTime = dayTimes[name];
      if (prayerTime.getTime() < now) continue;
      const fireAt = minutesBefore(prayerTime, PRAYER_NOTIFICATION_MINUTES_BEFORE);
      const dateStr = dayDate.toISOString().slice(0, 10);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${name.charAt(0).toUpperCase()}${name.slice(1)} prayer at ${formatPrayerTime(prayerTime)}`,
          body: 'The Sanctum calls. The pillar awaits.',
          data: { prayer: name, date: dateStr } as PrayerNotificationData,
          sound: 'default',
          categoryIdentifier: NOTIFICATION_CATEGORY_PRAYER,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
          channelId: 'prayer',
        },
      });
      ids.push(id);
    }
  }

  await setAppState(SCHEDULED_IDS_KEY, JSON.stringify(ids));
}

export async function scheduleSnoozeNotification(data: PrayerNotificationData): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Snoozed prayer reminder',
      body: `${data.prayer} awaits. Do not let it pass.`,
      data,
      sound: 'default',
      categoryIdentifier: NOTIFICATION_CATEGORY_PRAYER,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(Date.now() + 10 * 60 * 1000),
      channelId: 'prayer',
    },
  });
}

export function listenToNotificationResponses(
  handler: (data: Record<string, unknown>, actionId: string) => void,
): () => void {
  if (!notificationsSupported()) return () => {};
  let sub: { remove(): void } | null = null;
  let disposed = false;
  getNotifications()
    .then((Notifications) => {
      if (!Notifications || disposed) return;
      sub = Notifications.addNotificationResponseReceivedListener((response) => {
        handler(
          (response.notification.request.content.data ?? {}) as Record<string, unknown>,
          response.actionIdentifier,
        );
      });
    })
    .catch(() => {});
  return () => {
    disposed = true;
    sub?.remove();
  };
}

async function cancelStored(key: string): Promise<void> {
  const Notifications = await getNotifications();
  const raw = await getAppState(key);
  if (!raw || !Notifications) return;
  try {
    const ids: string[] = JSON.parse(raw);
    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
    }
  } catch {
    // ignore
  }
  await setAppState(key, '[]');
}

async function scheduleStored(key: string, id: string): Promise<void> {
  await setAppState(key, JSON.stringify([id]));
}

function nextDateAt(hour: number, minute: number): Date {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
  return d;
}

async function scheduleOneOff(input: {
  date: Date;
  title: string;
  body: string;
  category: string;
  data: Record<string, unknown>;
}): Promise<string | null> {
  const Notifications = await getNotifications();
  if (!Notifications) return null;
  return Notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
      data: input.data,
      sound: 'default',
      categoryIdentifier: input.category,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.date,
      channelId: 'prayer',
    },
  });
}

export async function scheduleStreakWarning(): Promise<void> {
  const key = 'notif_streak';
  await cancelStored(key);
  const id = await scheduleOneOff({
    date: nextDateAt(23, 0),
    title: 'The Day Nears Its End',
    body: 'Protect your streak — complete your rituals before midnight.',
    category: CAT_STREAK,
    data: { kind: 'streak' },
  });
  if (id) await scheduleStored(key, id);
}

export async function scheduleRelationWarning(lowCount: number): Promise<void> {
  const key = 'notif_relation';
  await cancelStored(key);
  if (lowCount <= 0) return;
  const id = await scheduleOneOff({
    date: nextDateAt(20, 0),
    title: 'Bonds Fading',
    body: `${lowCount} relation${lowCount === 1 ? '' : 's'} need your reach. Reconnect today.`,
    category: CAT_RELATION,
    data: { kind: 'relation' },
  });
  if (id) await scheduleStored(key, id);
}

export async function scheduleSprintBreak(projectName: string): Promise<void> {
  const key = 'notif_sprint';
  await cancelStored(key);
  const id = await scheduleOneOff({
    date: new Date(Date.now() + 25 * 60 * 1000),
    title: 'Focus Block Complete',
    body: `25 minutes on "${projectName}". Stretch, breathe, then return.`,
    category: CAT_SPRINT,
    data: { kind: 'sprint' },
  });
  if (id) await scheduleStored(key, id);
}

export async function cancelSprintBreak(): Promise<void> {
  await cancelStored('notif_sprint');
}

export async function notifyReportReady(): Promise<void> {
  await scheduleOneOff({
    date: new Date(),
    title: 'The Oracle Speaks',
    body: 'Your dawn report and three sacred quests await.',
    category: CAT_REPORT,
    data: { kind: 'report' },
  });
}
