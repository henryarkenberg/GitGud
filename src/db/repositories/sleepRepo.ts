import { getDatabase } from '@/db/database';
import type { SleepQuality, SleepSession, SleepSource } from '@/types';

interface SleepRow {
  id: string;
  sleep_start: string;
  sleep_end: string;
  duration_minutes: number;
  quality: SleepQuality | null;
  sleep_debt_minutes: number;
  source: SleepSource;
}

function rowToSession(row: SleepRow): SleepSession {
  return {
    id: row.id,
    sleepStart: row.sleep_start,
    sleepEnd: row.sleep_end,
    durationMinutes: row.duration_minutes,
    quality: row.quality,
    sleepDebtMinutes: row.sleep_debt_minutes,
    source: row.source,
  };
}

export async function getSessions(): Promise<SleepSession[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<SleepRow>(
    'SELECT * FROM sleep_sessions ORDER BY sleep_start DESC',
  );
  return rows.map(rowToSession);
}

export async function getLatestSession(): Promise<SleepSession | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SleepRow>(
    'SELECT * FROM sleep_sessions ORDER BY sleep_start DESC LIMIT 1',
  );
  return row ? rowToSession(row) : null;
}

export async function insertSession(session: SleepSession): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sleep_sessions (id, sleep_start, sleep_end, duration_minutes, quality, sleep_debt_minutes, source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    session.id,
    session.sleepStart,
    session.sleepEnd,
    session.durationMinutes,
    session.quality,
    session.sleepDebtMinutes,
    session.source,
  );
}

export async function updateSession(
  id: string,
  patch: {
    sleepStart?: string;
    sleepEnd?: string;
    durationMinutes?: number;
    quality?: SleepQuality | null;
    sleepDebtMinutes?: number;
  },
): Promise<void> {
  const db = await getDatabase();
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (patch.sleepStart !== undefined) {
    assignments.push('sleep_start = ?');
    values.push(patch.sleepStart);
  }
  if (patch.sleepEnd !== undefined) {
    assignments.push('sleep_end = ?');
    values.push(patch.sleepEnd);
  }
  if (patch.durationMinutes !== undefined) {
    assignments.push('duration_minutes = ?');
    values.push(patch.durationMinutes);
  }
  if (patch.quality !== undefined) {
    assignments.push('quality = ?');
    values.push(patch.quality);
  }
  if (patch.sleepDebtMinutes !== undefined) {
    assignments.push('sleep_debt_minutes = ?');
    values.push(patch.sleepDebtMinutes);
  }
  if (assignments.length === 0) return;
  await db.runAsync(`UPDATE sleep_sessions SET ${assignments.join(', ')} WHERE id = ?`, ...values, id);
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM sleep_sessions WHERE id = ?', id);
}

export async function clearSleepDebt(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE sleep_sessions SET sleep_debt_minutes = 0');
}
