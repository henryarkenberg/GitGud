import * as SQLite from 'expo-sqlite';

import { SCHEMA_SQL } from './schema';

const DB_NAME = 'gitgud.db';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Serialize DB access so concurrent hydrates/queries don't race on the shared
// native statement (which surfaces as "Cannot use shared object that was already
// released" from expo-sqlite). withTransactionAsync is intentionally NOT wrapped
// to avoid a nested deadlock (its task already runs through this queue).
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(op: () => Promise<T>): Promise<T> {
  const run = queue.then(op, op);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

const SERIALIZED = new Set(['runAsync', 'getAllAsync', 'getFirstAsync', 'execAsync']);

function wrap(db: SQLite.SQLiteDatabase): SQLite.SQLiteDatabase {
  return new Proxy(db, {
    get(target, prop) {
      const value = (target as unknown as Record<string, unknown>)[prop as string];
      if (typeof value === 'function' && SERIALIZED.has(prop as string)) {
        return (...args: unknown[]) => serialize(() => (value as (...a: unknown[]) => Promise<unknown>).apply(target, args));
      }
      return value;
    },
  });
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (!dbPromise) {
    dbPromise = (async () => {
      const instance = await SQLite.openDatabaseAsync(DB_NAME);
      await instance.execAsync(SCHEMA_SQL);
      db = wrap(instance);
      return db;
    })();
  }
  return dbPromise;
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM user_profile;
    DELETE FROM ledger_entries;
    DELETE FROM app_state;
    DELETE FROM prayers;
    DELETE FROM qada_prayers;
    DELETE FROM sleep_sessions;
    DELETE FROM habits;
    DELETE FROM habit_logs;
    DELETE FROM objectives;
    DELETE FROM projects;
    DELETE FROM project_tasks;
    DELETE FROM sprints;
    DELETE FROM exercises;
    DELETE FROM meals;
    DELETE FROM daily_fitness;
    DELETE FROM relations;
    DELETE FROM relation_activities;
    DELETE FROM relation_milestones;
    DELETE FROM daily_quests;
    DELETE FROM skill_tree_nodes;
    DELETE FROM node_connections;
  `);
}