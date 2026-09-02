import { getDatabase } from '@/db/database';
import type { LedgerEntry } from '@/types';

interface LedgerRow {
  id: string;
  timestamp: string;
  module: string;
  action: string;
  entity_id: string;
  xp_change: number;
  stat_changes: string;
  metadata: string;
}

function rowToEntry(row: LedgerRow): LedgerEntry {
  let statChanges: LedgerEntry['statChanges'] = {};
  let metadata: Record<string, unknown> = {};
  try {
    statChanges = JSON.parse(row.stat_changes);
  } catch {
    // keep empty
  }
  try {
    metadata = JSON.parse(row.metadata);
  } catch {
    // keep empty
  }
  return {
    id: row.id,
    timestamp: row.timestamp,
    module: row.module,
    action: row.action,
    entityId: row.entity_id,
    xpChange: row.xp_change,
    statChanges,
    metadata,
  };
}

export async function insertLedgerEntry(entry: LedgerEntry): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO ledger_entries (id, timestamp, module, action, entity_id, xp_change, stat_changes, metadata)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    entry.id,
    entry.timestamp,
    entry.module,
    entry.action,
    entry.entityId,
    entry.xpChange,
    JSON.stringify(entry.statChanges),
    JSON.stringify(entry.metadata),
  );
}

export async function getAllLedgerEntries(): Promise<LedgerEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LedgerRow>(
    'SELECT * FROM ledger_entries ORDER BY timestamp DESC LIMIT 500',
  );
  return rows.map(rowToEntry);
}

export async function getLedgerCount(): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM ledger_entries',
  );
  return row?.count ?? 0;
}