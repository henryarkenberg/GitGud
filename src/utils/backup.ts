import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { getDatabase } from '@/db/database';

const TABLE_LIST = [
  'user_profile',
  'ledger_entries',
  'app_state',
  'prayers',
  'qada_prayers',
  'sleep_sessions',
  'habits',
  'habit_logs',
  'objectives',
  'projects',
  'project_tasks',
  'sprints',
  'exercises',
  'meals',
  'daily_fitness',
  'relations',
  'relation_activities',
  'relation_milestones',
  'daily_quests',
  'skill_tree_nodes',
  'node_connections',
] as const;

type Tables = Record<string, Record<string, unknown>[]>;

export async function dumpAll(): Promise<Tables> {
  const db = await getDatabase();
  const out: Tables = {};
  for (const table of TABLE_LIST) {
    const rows = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM ${table}`);
    out[table] = rows;
  }
  return out;
}

export async function restoreAll(tables: Tables): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    for (const table of TABLE_LIST) {
      await db.runAsync(`DELETE FROM ${table}`);
    }
    for (const table of TABLE_LIST) {
      const rows = tables[table] ?? [];
      for (const row of rows) {
        const keys = Object.keys(row);
        if (keys.length === 0) continue;
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        await db.runAsync(sql, ...keys.map((k) => row[k] as never));
      }
    }
  });
}

function stamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

export async function writeBackupFile(payload: object, name: string): Promise<File> {
  const file = new File(Paths.document, name);
  file.write(JSON.stringify(payload, null, 2));
  return file;
}

export async function exportFullBackup(silent = false): Promise<{ ok: boolean; message: string }> {
  try {
    const tables = await dumpAll();
    const payload = { app: 'GitGud', version: 2, exportedAt: new Date().toISOString(), tables };
    const file = await writeBackupFile(payload, `gitgud-backup-${stamp()}.json`);
    if (!silent && Platform.OS !== 'web' && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export GitGud backup' });
    }
    return { ok: true, message: silent ? 'Backup written before restore' : `Backup written to ${file.uri}` };
  } catch (error) {
    console.error('Export backup failed', error);
    return { ok: false, message: 'Export failed. See logs.' };
  }
}

export async function listBackups(): Promise<File[]> {
  const dir = new Directory(Paths.document);
  if (!dir.exists) return [];
  return dir
    .list()
    .filter((x): x is File => x instanceof File && x.name.startsWith('gitgud-backup-') && x.name.endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function importLatestBackup(): Promise<{ ok: boolean; message: string }> {
  try {
    const backups = await listBackups();
    if (backups.length === 0) {
      return { ok: false, message: 'No backup found to restore.' };
    }
    // Auto-backup current state before overwriting.
    await exportFullBackup(true);

    const file = backups[backups.length - 1];
    const data = JSON.parse(await file.text()) as { version?: number; tables?: Tables };
    if (!data.tables) {
      return { ok: false, message: 'This backup uses an older format. Export a fresh backup first.' };
    }
    await restoreAll(data.tables);
    return { ok: true, message: `Restored ${file.name}` };
  } catch (error) {
    console.error('Import failed', error);
    return { ok: false, message: 'Import failed. See logs.' };
  }
}
