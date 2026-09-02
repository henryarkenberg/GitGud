import * as adhan from 'adhan';

import { METHOD_TO_ADHAN } from '@/constants/prayers';
import type { Madhab, PrayerMethodId, PrayerName, PrayerSettings } from '@/types';

export interface PrayerTimesMap {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  nextFajr: Date;
}

export interface PrayerTimeSlot {
  name: PrayerName;
  time: Date;
  windowEnd: Date;
}

export function buildCalculationParameters(
  method: PrayerMethodId,
  madhab: Madhab,
): adhan.CalculationParameters {
  let params: adhan.CalculationParameters;
  if (method === 'jafari') {
    // Jafari (Shia): Fajr 16°, Isha 14°, Maghrib 4°
    params = new adhan.CalculationParameters(null, 16, 14, 0, 4);
  } else {
    const key = METHOD_TO_ADHAN[method] as keyof typeof adhan.CalculationMethod;
    params = adhan.CalculationMethod[key]();
  }
  params.madhab = madhab === 'hanafi' ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;
  return params;
}

export function getPrayerTimesFor(
  coordinates: { latitude: number; longitude: number },
  date: Date,
  settings: Pick<PrayerSettings, 'method' | 'madhab'>,
): PrayerTimesMap {
  const coords = new adhan.Coordinates(coordinates.latitude, coordinates.longitude);
  const params = buildCalculationParameters(settings.method, settings.madhab);
  const today = new adhan.PrayerTimes(coords, date, params);
  const tomorrow = new adhan.PrayerTimes(
    coords,
    new Date(date.getTime() + 24 * 60 * 60 * 1000),
    params,
  );
  return {
    fajr: today.fajr,
    sunrise: today.sunrise,
    dhuhr: today.dhuhr,
    asr: today.asr,
    maghrib: today.maghrib,
    isha: today.isha,
    nextFajr: tomorrow.fajr,
  };
}

export function windowEndFor(name: PrayerName, times: PrayerTimesMap): Date {
  switch (name) {
    case 'fajr':
      return times.sunrise;
    case 'dhuhr':
      return times.asr;
    case 'asr':
      return times.maghrib;
    case 'maghrib':
      return times.isha;
    case 'isha':
      return times.nextFajr;
  }
}

export function prayerSlotsFor(times: PrayerTimesMap): PrayerTimeSlot[] {
  const names: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  return names.map((name) => ({ name, time: times[name], windowEnd: windowEndFor(name, times) }));
}

export function formatPrayerTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}

export function nextPrayerName(now: Date, times: PrayerTimesMap): PrayerName | null {
  const slots = prayerSlotsFor(times);
  const upcoming = slots.find((s) => s.time.getTime() > now.getTime());
  return upcoming ? upcoming.name : null;
}

export interface PrayerCountdown {
  kind: 'countdown' | 'time' | 'qaza';
  prayer: PrayerName;
  ms: number;
}

export function getPrayerCountdown(now: Date, times: PrayerTimesMap): PrayerCountdown {
  const slots = prayerSlotsFor(times);
  const nowMs = now.getTime();
  const active = slots.filter((s) => s.time.getTime() <= nowMs).pop();

  if (!active) {
    return { kind: 'countdown', prayer: slots[0].name, ms: slots[0].time.getTime() - nowMs };
  }
  const windowEndMs = active.windowEnd.getTime();
  if (nowMs < windowEndMs) {
    if (nowMs - active.time.getTime() < 15 * 60 * 1000) {
      return { kind: 'time', prayer: active.name, ms: 0 };
    }
    return { kind: 'qaza', prayer: active.name, ms: windowEndMs - nowMs };
  }
  const idx = slots.findIndex((s) => s.name === active.name);
  const next = slots[idx + 1];
  if (next) return { kind: 'countdown', prayer: next.name, ms: next.time.getTime() - nowMs };
  return { kind: 'countdown', prayer: 'fajr', ms: times.nextFajr.getTime() - nowMs };
}

export function formatTimespan(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatHeroTime(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}M`;
  return `${h}H ${m}M`;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export interface PrayerGauge {
  progress: number;
  qada: number;
  agoMs: number;
  tillNextMs: number;
  nextName: PrayerName;
}

export function prayerGauge(now: Date, times: PrayerTimesMap): PrayerGauge {
  const slots = prayerSlotsFor(times);
  const nowMs = now.getTime();
  const next = slots.find((s) => s.time.getTime() > nowMs);

  if (!next) {
    const lastT = slots[slots.length - 1].time.getTime();
    const nextT = times.nextFajr.getTime();
    const total = Math.max(1, nextT - lastT);
    const qadaT = Math.min(nextT, windowEndFor(slots[slots.length - 1].name, times).getTime());
    return {
      progress: clamp01((nowMs - lastT) / total),
      qada: clamp01((qadaT - lastT) / total),
      agoMs: nowMs - lastT,
      tillNextMs: Math.max(0, nextT - nowMs),
      nextName: 'fajr',
    };
  }

  const idx = slots.indexOf(next);
  const lastT = idx > 0 ? slots[idx - 1].time.getTime() : next.time.getTime() - 12 * 3600 * 1000;
  const nextT = next.time.getTime();
  const total = Math.max(1, nextT - lastT);
  const activeName = idx > 0 ? slots[idx - 1].name : next.name;
  const qadaT = Math.min(nextT, windowEndFor(activeName, times).getTime());
  return {
    progress: clamp01((nowMs - lastT) / total),
    qada: clamp01((qadaT - lastT) / total),
    agoMs: nowMs - lastT,
    tillNextMs: Math.max(0, nextT - nowMs),
    nextName: next.name,
  };
}

export function isPrayerStarted(now: Date, name: PrayerName, times: PrayerTimesMap): boolean {
  return now.getTime() >= times[name].getTime();
}