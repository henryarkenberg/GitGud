import { getDatabase } from '@/db/database';
import type { AISettings, PrayerSettings, Stats, ThemePreference, UserProfile } from '@/types';

interface ProfileRow {
  id: string;
  name: string;
  level: number;
  total_xp: number;
  skill_points: number;
  gold: number;
  stats: string;
  prayer_settings: string;
  ai_settings: string;
  theme: string;
  onboarding_complete: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
}

function rowToProfile(row: ProfileRow): UserProfile {
  let stats: Stats = {
    faith: 5,
    discipline: 5,
    strength: 5,
    agility: 5,
    vitality: 5,
    wisdom: 5,
    focus: 5,
    charisma: 5,
    empathy: 5,
  };
  let prayerSettings: PrayerSettings = {
    method: 'muslim-world-league',
    madhab: 'hanafi',
    notificationsEnabled: true,
  };
  let aiSettings: AISettings = { apiKey: '', model: 'gpt-4o-mini', dailyReportTime: '07:00', enabledModules: [] };
  try {
    stats = { ...stats, ...(JSON.parse(row.stats) as Stats) };
  } catch {
    // keep defaults
  }
  try {
    prayerSettings = { ...prayerSettings, ...(JSON.parse(row.prayer_settings) as PrayerSettings) };
  } catch {
    // keep defaults
  }
  try {
    aiSettings = { ...aiSettings, ...(JSON.parse(row.ai_settings) as AISettings) };
  } catch {
    // keep defaults
  }
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    totalXp: row.total_xp,
    skillPoints: row.skill_points,
    gold: row.gold,
    stats,
    prayerSettings,
    aiSettings,
    theme: (row.theme as ThemePreference) ?? 'system',
    onboardingComplete: row.onboarding_complete === 1,
    currentStreak: row.current_streak,
    longestStreak: row.longest_streak,
    createdAt: row.created_at,
  };
}

export async function getProfile(): Promise<UserProfile | null> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProfileRow>('SELECT * FROM user_profile LIMIT 1');
  return rows.length ? rowToProfile(rows[0]) : null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile
      (id, name, level, total_xp, skill_points, gold, stats, prayer_settings, ai_settings, theme, onboarding_complete, current_streak, longest_streak, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    profile.id,
    profile.name,
    profile.level,
    profile.totalXp,
    profile.skillPoints,
    profile.gold,
    JSON.stringify(profile.stats),
    JSON.stringify(profile.prayerSettings),
    JSON.stringify(profile.aiSettings),
    profile.theme,
    profile.onboardingComplete ? 1 : 0,
    profile.currentStreak,
    profile.longestStreak,
    profile.createdAt,
  );
}

export async function updateProfile(profile: Partial<UserProfile> & { id: string }): Promise<void> {
  const existing = await getProfile();
  if (!existing) return;
  await saveProfile({ ...existing, ...profile });
}