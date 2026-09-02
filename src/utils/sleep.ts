import type { SleepSession } from '@/types';

export function isValidISODate(iso: string | null | undefined): iso is string {
  if (!iso) return false;
  const d = new Date(iso);
  return !Number.isNaN(d.getTime());
}

export function durationBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

export function sleepDeficit(durationMinutes: number, targetMinutes: number): number {
  if (!Number.isFinite(durationMinutes)) return 0;
  return Math.max(0, targetMinutes - durationMinutes);
}

export function sleepOvershoot(durationMinutes: number, targetMinutes: number): number {
  if (!Number.isFinite(durationMinutes)) return 0;
  return Math.max(0, durationMinutes - targetMinutes);
}

export function computeDebt(sessions: SleepSession[], targetMinutes: number): number {
  const sorted = [...sessions].sort((a, b) => a.sleepStart.localeCompare(b.sleepStart));
  let running = 0;
  for (const s of sorted) {
    running = Math.max(
      0,
      running + sleepDeficit(s.durationMinutes, targetMinutes) - sleepOvershoot(s.durationMinutes, targetMinutes),
    );
  }
  return running;
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatClock(iso: string): string {
  if (!isValidISODate(iso)) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(d);
}

export function dateOfISO(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function minuteOfDay(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function dayOffset(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  d.setHours(0, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function dailyDurationByEnd(sessions: SleepSession[], days: number): { date: string; minutes: number }[] {
  const out: { date: string; minutes: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = dayOffset(d.toISOString());
    let minutes = 0;
    for (const s of sessions) {
      if (dayOffset(s.sleepEnd) === key && Number.isFinite(s.durationMinutes)) minutes += s.durationMinutes;
    }
    out.push({ date: key, minutes });
  }
  return out;
}
