import { getDatabase } from '@/db/database';

export async function getAppState(key: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_state WHERE key = ?',
    key,
  );
  return row?.value ?? null;
}

export async function setAppState(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO app_state (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key,
    value,
  );
}

export async function removeAppState(key: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM app_state WHERE key = ?', key);
}