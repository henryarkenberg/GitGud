import { getDatabase } from '@/db/database';
import type { PrayerName, PrayerRecord, PrayerStatus, QadaPrayer } from '@/types';

interface PrayerRow {
  id: string;
  name: PrayerName;
  date: string;
  scheduled_time: string;
  status: PrayerStatus;
  prayed_at: string | null;
  xp_earned: number;
}

interface QadaRow {
  id: string;
  original_date: string;
  prayer_name: PrayerName;
  prayed_at: string | null;
  xp_earned: number;
}

function rowToPrayer(row: PrayerRow): PrayerRecord {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    scheduledTime: row.scheduled_time,
    status: row.status,
    prayedAt: row.prayed_at,
    xpEarned: row.xp_earned,
  };
}

function rowToQada(row: QadaRow): QadaPrayer {
  return {
    id: row.id,
    originalDate: row.original_date,
    prayerName: row.prayer_name,
    prayedAt: row.prayed_at,
    xpEarned: row.xp_earned,
  };
}

export async function getPrayersForDate(date: string): Promise<PrayerRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PrayerRow>(
    'SELECT * FROM prayers WHERE date = ? ORDER BY scheduled_time ASC',
    date,
  );
  return rows.map(rowToPrayer);
}

export async function getPendingPrayersBefore(date: string): Promise<PrayerRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<PrayerRow>(
    "SELECT * FROM prayers WHERE status = 'pending' AND date < ? ORDER BY scheduled_time ASC",
    date,
  );
  return rows.map(rowToPrayer);
}

export async function ensurePrayerRow(prayer: PrayerRecord): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO prayers (id, name, date, scheduled_time, status, prayed_at, xp_earned)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    prayer.id,
    prayer.name,
    prayer.date,
    prayer.scheduledTime,
    prayer.status,
    prayer.prayedAt,
    prayer.xpEarned,
  );
}

export async function updatePrayer(
  name: PrayerName,
  date: string,
  patch: { status: PrayerStatus; prayedAt: string | null; xpEarned: number },
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE prayers SET status = ?, prayed_at = ?, xp_earned = ? WHERE name = ? AND date = ?',
    patch.status,
    patch.prayedAt,
    patch.xpEarned,
    name,
    date,
  );
}

export async function getTodayCounts(
  date: string,
): Promise<{ onTime: number; late: number; missed: number; pending: number }> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ status: PrayerStatus; count: number }>(
    'SELECT status, COUNT(*) AS count FROM prayers WHERE date = ? GROUP BY status',
    date,
  );
  const counts = { onTime: 0, late: 0, missed: 0, pending: 0 };
  for (const row of rows) {
    if (row.status === 'on-time') counts.onTime = row.count;
    else if (row.status === 'late') counts.late = row.count;
    else if (row.status === 'missed') counts.missed = row.count;
    else counts.pending = row.count;
  }
  return counts;
}

export async function addQadaPrayer(
  originalDate: string,
  prayerName: PrayerName,
  id: string,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR IGNORE INTO qada_prayers (id, original_date, prayer_name)
     VALUES (?, ?, ?)`,
    id,
    originalDate,
    prayerName,
  );
}

export async function removeQadaPrayer(originalDate: string, prayerName: PrayerName): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM qada_prayers WHERE original_date = ? AND prayer_name = ?',
    originalDate,
    prayerName,
  );
}

export async function getQadaQueue(): Promise<QadaPrayer[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<QadaRow>(
    `SELECT * FROM qada_prayers WHERE prayed_at IS NULL
     ORDER BY original_date ASC, prayer_name ASC`,
  );
  return rows.map(rowToQada);
}

export async function getQadaCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM qada_prayers WHERE prayed_at IS NULL',
  );
  return row?.count ?? 0;
}

export async function markQadaPrayed(id: string, prayedAt: string, xpEarned: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE qada_prayers SET prayed_at = ?, xp_earned = ? WHERE id = ?',
    prayedAt,
    xpEarned,
    id,
  );
}

export async function getQadaFor(originalDate: string, prayerName: PrayerName): Promise<QadaPrayer | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<QadaRow>(
    'SELECT * FROM qada_prayers WHERE original_date = ? AND prayer_name = ?',
    originalDate,
    prayerName,
  );
  return row ? rowToQada(row) : null;
}

export async function setQadaUnprayed(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE qada_prayers SET prayed_at = NULL, xp_earned = 0 WHERE id = ?', id);
}

export async function completeAllQada(prayedAt: string, xpEarned: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE qada_prayers SET prayed_at = ?, xp_earned = ? WHERE prayed_at IS NULL',
    prayedAt,
    xpEarned,
  );
}