import { Clock, MoonStar, Sun, SunMedium, Sunset, type LucideIcon } from 'lucide-react-native';

import type { PrayerMethodId, PrayerName } from '@/types';

export const PRAYER_META: Record<
  PrayerName,
  { label: string; icon: LucideIcon; subtitle: string; color: string; reason: string }
> = {
  fajr: {
    label: 'Fajr',
    icon: Sun,
    subtitle: 'Dawn',
    color: '#F59E0B',
    reason: 'Beginning & protection · place Allah before the world.',
  },
  dhuhr: {
    label: 'Dhuhr',
    icon: SunMedium,
    subtitle: 'Midday',
    color: '#FACC15',
    reason: 'Return & interruption · leave the world to return to Allah.',
  },
  asr: {
    label: 'Asr',
    icon: Clock,
    subtitle: 'Afternoon',
    color: '#FB923C',
    reason: 'Guarding & perseverance · do not lose Allah to distraction.',
  },
  maghrib: {
    label: 'Maghrib',
    icon: Sunset,
    subtitle: 'Sunset',
    color: '#F87171',
    reason: 'Transition & gratitude · the day turns into night.',
  },
  isha: {
    label: 'Isha',
    icon: MoonStar,
    subtitle: 'Night',
    color: '#818CF8',
    reason: 'Completion & surrender · entrust the night to Allah.',
  },
};

export const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const XP_PRAYER_ON_TIME = 50;
export const XP_PRAYER_LATE = 30;
export const XP_PRAYER_QADA = 25;

export const XP_EXTRA_PRAYER_PER_RAKAT = 2;
export const FAITH_EXTRA_PRAYER = 1;

export const PRAYER_NOTIFICATION_MINUTES_BEFORE = 15;

export const NOTIFICATION_CATEGORY_PRAYER = 'prayer';

export const PRAYER_ACTION_PRAYED = 'PRAYED';
export const PRAYER_ACTION_SNOOZE = 'SNOOZE';

export const METHOD_TO_ADHAN: Record<PrayerMethodId, string> = {
  'muslim-world-league': 'MuslimWorldLeague',
  isna: 'NorthAmerica',
  egyptian: 'Egyptian',
  'umm-al-qura': 'UmmAlQura',
  karachi: 'Karachi',
  dubai: 'Dubai',
  'moonsighting-committee': 'MoonsightingCommittee',
  kuwait: 'Kuwait',
  qatar: 'Qatar',
  singapore: 'Singapore',
  turkey: 'Turkey',
  tehran: 'Tehran',
  jafari: 'jafari',
};

export const DEFAULT_COORDS = { latitude: 21.4225, longitude: 39.8262, label: 'Makkah (default)' };