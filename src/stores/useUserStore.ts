import { create } from 'zustand';

import { getProfile, saveProfile, updateProfile } from '@/db/repositories/profileRepo';
import type { UserProfile } from '@/types';
import { createId } from '@/utils/id';

interface UserState {
  profile: UserProfile | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  completeOnboarding: (input: {
    name: string;
    theme: UserProfile['theme'];
    prayerSettings: UserProfile['prayerSettings'];
    aiSettings: UserProfile['aiSettings'];
  }) => Promise<void>;
  patchProfile: (patch: Partial<Omit<UserProfile, 'id'>>) => Promise<void>;
  clear: () => void;
}

export const useUserStore = create<UserState>()((set, get) => ({
  profile: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const profile = await getProfile();
      set({ profile, hydrated: true });
    } catch (error) {
      console.error('Failed to hydrate user profile', error);
      set({ hydrated: true });
    }
  },

  completeOnboarding: async (input) => {
    const profile: UserProfile = {
      id: createId('hero'),
      name: input.name.trim() || 'Warrior',
      level: 1,
      totalXp: 0,
      skillPoints: 0,
      gold: 0,
      stats: {
        faith: 5,
        discipline: 5,
        strength: 5,
        agility: 5,
        vitality: 5,
        wisdom: 5,
        focus: 5,
        charisma: 5,
        empathy: 5,
      },
      prayerSettings: input.prayerSettings,
      aiSettings: {
        apiKey: input.aiSettings.apiKey,
        model: input.aiSettings.model,
        dailyReportTime: input.aiSettings.dailyReportTime,
        enabledModules: [],
      },
      theme: input.theme,
      onboardingComplete: true,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date().toISOString(),
    };
    await saveProfile(profile);
    set({ profile });
  },

  patchProfile: async (patch) => {
    const current = get().profile;
    if (!current) return;
    const next = { ...current, ...patch };
    await updateProfile(next);
    set({ profile: next });
  },

  clear: () => set({ profile: null }),
}));