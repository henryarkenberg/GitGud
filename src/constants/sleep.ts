import type { SleepQuality } from '@/types';

export const SLEEP_TARGET_MINUTES_DEFAULT = 480;
export const SLEEP_TARGET_MIN = 360;
export const SLEEP_TARGET_MAX = 720;
export const SLEEP_TARGET_STEP = 30;

export const SLEEP_DEBT_WARNING_HOURS = 2;

export const SLEEP_PREPARE_DELAY_MINUTES = 10;

export const SLEEP_QUALITY_META: Record<
  SleepQuality,
  { label: string; tone: 'danger' | 'warning' | 'info' | 'success' }
> = {
  poor: { label: 'Poor', tone: 'danger' },
  fair: { label: 'Fair', tone: 'warning' },
  good: { label: 'Good', tone: 'info' },
  excellent: { label: 'Excellent', tone: 'success' },
};
