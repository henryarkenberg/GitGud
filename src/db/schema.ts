export const SCHEMA_VERSION = 9;

export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Warrior',
  level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  skill_points INTEGER NOT NULL DEFAULT 0,
  gold INTEGER NOT NULL DEFAULT 0,
  stats TEXT NOT NULL DEFAULT '{}',
  prayer_settings TEXT NOT NULL DEFAULT '{}',
  ai_settings TEXT NOT NULL DEFAULT '{}',
  theme TEXT NOT NULL DEFAULT 'system',
  onboarding_complete INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_id TEXT NOT NULL DEFAULT '',
  xp_change INTEGER NOT NULL DEFAULT 0,
  stat_changes TEXT NOT NULL DEFAULT '{}',
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prayers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  prayed_at TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(name, date)
);

CREATE TABLE IF NOT EXISTS qada_prayers (
  id TEXT PRIMARY KEY,
  original_date TEXT NOT NULL,
  prayer_name TEXT NOT NULL,
  prayed_at TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(original_date, prayer_name)
);

CREATE TABLE IF NOT EXISTS sleep_sessions (
  id TEXT PRIMARY KEY,
  sleep_start TEXT NOT NULL,
  sleep_end TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  quality TEXT,
  sleep_debt_minutes INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'signal'
);

CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  repeat_pattern TEXT NOT NULL,
  related_stat TEXT NOT NULL,
  base_xp INTEGER NOT NULL DEFAULT 10,
  color TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'flame',
  streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  last_freeze_date TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY,
  habit_id TEXT NOT NULL,
  date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  UNIQUE(habit_id, date)
);

CREATE TABLE IF NOT EXISTS objectives (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  deadline TEXT,
  difficulty TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  tags TEXT NOT NULL DEFAULT '[]',
  related_stat TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  is_generated_by_ai INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'hammer',
  status TEXT NOT NULL DEFAULT 'active',
  total_time_spent_minutes INTEGER NOT NULL DEFAULT 0,
  target_hours REAL,
  related_stat TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'once',
  repeat_pattern TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  deadline TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  last_completed_date TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sprints (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  is_running INTEGER NOT NULL DEFAULT 0,
  accumulated_seconds INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  subtype TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  distance_km REAL,
  calories_burned INTEGER,
  date TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  quality TEXT NOT NULL,
  date TEXT NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_fitness (
  date TEXT PRIMARY KEY,
  water_glasses INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS relations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  health INTEGER NOT NULL DEFAULT 100,
  max_health INTEGER NOT NULL DEFAULT 100,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  last_interaction TEXT,
  avatar TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS relation_activities (
  id TEXT PRIMARY KEY,
  relation_id TEXT NOT NULL,
  type TEXT NOT NULL,
  duration_minutes INTEGER,
  note TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  health_restored INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS relation_milestones (
  id TEXT PRIMARY KEY,
  relation_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_activities TEXT NOT NULL DEFAULT '{}',
  reward_stat TEXT NOT NULL,
  reward_points INTEGER NOT NULL DEFAULT 0,
  is_unlocked INTEGER NOT NULL DEFAULT 0,
  unlocked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'habit',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  xp_reward INTEGER NOT NULL DEFAULT 0,
  related_stat TEXT NOT NULL DEFAULT 'discipline',
  is_completed INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT,
  generated_by_ai INTEGER NOT NULL DEFAULT 1,
  date TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS skill_tree_nodes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  node_type TEXT NOT NULL,
  cost_sp INTEGER NOT NULL DEFAULT 0,
  requirements TEXT NOT NULL DEFAULT '{}',
  rewards TEXT NOT NULL DEFAULT '{}',
  rarity TEXT NOT NULL DEFAULT 'common',
  related_stat TEXT NOT NULL DEFAULT 'discipline',
  position_x REAL NOT NULL DEFAULT 0,
  position_y REAL NOT NULL DEFAULT 0,
  is_unlocked INTEGER NOT NULL DEFAULT 0,
  unlocked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS node_connections (
  id TEXT PRIMARY KEY,
  from_node_id TEXT NOT NULL,
  to_node_id TEXT NOT NULL,
  UNIQUE(from_node_id, to_node_id)
);

CREATE INDEX IF NOT EXISTS idx_ledger_timestamp ON ledger_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_ledger_module ON ledger_entries(module);
CREATE INDEX IF NOT EXISTS idx_prayers_date ON prayers(date);
CREATE INDEX IF NOT EXISTS idx_qada_unprayed ON qada_prayers(prayed_at);
CREATE INDEX IF NOT EXISTS idx_sleep_start ON sleep_sessions(sleep_start);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_objectives_status ON objectives(status);
CREATE INDEX IF NOT EXISTS idx_sprints_project ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_exercises_date ON exercises(date);
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(date);
CREATE INDEX IF NOT EXISTS idx_relation_activities_date ON relation_activities(date);
CREATE INDEX IF NOT EXISTS idx_daily_quests_date ON daily_quests(date);
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_unlocked ON skill_tree_nodes(is_unlocked);
`;

export const RESET_SQL = `
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
`;