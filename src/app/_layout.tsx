import '../global.css';

import {
  Cinzel_400Regular,
  Cinzel_500Medium,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
} from '@expo-google-fonts/cinzel';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';

import { DEFAULT_COORDS, PRAYER_ACTION_PRAYED, PRAYER_ACTION_SNOOZE, PRAYER_ORDER } from '@/constants/prayers';
import { LevelUpModal } from '@/components/shared/LevelUpModal';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  configureNotifications,
  listenToNotificationResponses,
  scheduleRelationWarning,
  scheduleSnoozeNotification,
  scheduleStreakWarning,
} from '@/services/notifications';
import { applyDaily } from '@/services/progression';
import { maybeGenerateEvent } from '@/services/ai/oracle';
import { useHabitStore } from '@/stores/useHabitStore';
import { useForgeStore } from '@/stores/useForgeStore';
import { useFitnessStore } from '@/stores/useFitnessStore';
import { usePrayerStore } from '@/stores/usePrayerStore';
import { useQuestStore } from '@/stores/useQuestStore';
import { useRelationStore } from '@/stores/useRelationStore';
import { useOracleStore } from '@/stores/useOracleStore';
import { useSkillTreeStore } from '@/stores/useSkillTreeStore';
import { useSleepStore } from '@/stores/useSleepStore';
import { useThemeStore } from '@/stores/useThemeStore';
import { useUserStore } from '@/stores/useUserStore';
import { getPrayerTimesFor, type PrayerTimesMap } from '@/utils/prayerTimes';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useAppTheme();

  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.background).catch(() => {});
  }, [theme.background]);

  useEffect(() => {
    configureNotifications().catch(() => {});
    useSleepStore.getState().hydrate().catch(() => {});
    useHabitStore.getState().hydrate().catch(() => {});
    useQuestStore.getState().hydrate().catch(() => {});
    useForgeStore.getState().hydrate().catch(() => {});
    useFitnessStore.getState().hydrate().catch(() => {});
    useRelationStore.getState().hydrate().then(() => {
      const low = useRelationStore.getState().relations.filter((r) => r.health < 40).length;
      void scheduleStreakWarning().catch(() => {});
      void scheduleRelationWarning(low).catch(() => {});
    }).catch(() => {});
    useOracleStore.getState().hydrate().then(() => {
      maybeGenerateEvent().then(() => useOracleStore.getState().hydrate()).catch(() => {});
    });
    useSkillTreeStore.getState().hydrate().catch(() => {});
    useUserStore.getState().hydrate().then(() => {
      const profile = useUserStore.getState().profile;
      applyDaily().catch(() => {});
      if (profile) {
        if (useThemeStore.getState().preference === 'system' && profile.theme !== 'system') {
          useThemeStore.getState().setPreference(profile.theme);
        }
        const times: PrayerTimesMap | null = getPrayerTimesFor(
          profile.prayerSettings.location ?? DEFAULT_COORDS,
          new Date(),
          profile.prayerSettings,
        );
        usePrayerStore.getState().hydrate(times);
      }
    });
    const removeResponseListener = listenToNotificationResponses((data, actionId) => {
      const prayer = data?.prayer;
      if (typeof prayer !== 'string' || !PRAYER_ORDER.includes(prayer as never)) return;
      const prayerName = prayer as (typeof PRAYER_ORDER)[number];
      const date = typeof data.date === 'string' ? data.date : '';
      if (actionId === PRAYER_ACTION_SNOOZE) {
        scheduleSnoozeNotification({ prayer: prayerName, date }).catch(() => {});
        return;
      }
      if (actionId === PRAYER_ACTION_PRAYED) {
        const profile = useUserStore.getState().profile;
        if (!profile) return;
        const times = getPrayerTimesFor(
          profile.prayerSettings.location ?? DEFAULT_COORDS,
          new Date(),
          profile.prayerSettings,
        );
        usePrayerStore.getState().markPrayed(prayerName, times);
      }
    });
    return removeResponseListener;
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  const base = theme.name === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.backgroundSecondary,
      text: theme.text,
      border: theme.border,
      notification: theme.danger,
    },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={theme.name === 'dark' ? 'light' : 'dark'} />
      {fontsLoaded ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(stack)" />
        </Stack>
      ) : null}
      <LevelUpModal />
    </ThemeProvider>
  );
}