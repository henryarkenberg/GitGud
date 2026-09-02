import { router } from 'expo-router';
import { Check, ChevronRight, Moon } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSleepStore } from '@/stores/useSleepStore';
import { SLEEP_DEBT_WARNING_HOURS, SLEEP_TARGET_MINUTES_DEFAULT } from '@/constants/sleep';
import { formatClock, formatDuration } from '@/utils/sleep';

export function SleepTodayCard() {
  const { theme } = useAppTheme();
  const latestSession = useSleepStore((s) => s.latestSession);
  const debtMinutes = useSleepStore((s) => s.debtMinutes);
  const activeSleepStart = useSleepStore((s) => s.activeSleepStart);
  const targetMinutes = useSleepStore((s) => s.targetMinutes);
  const markAwake = useSleepStore((s) => s.markAwake);
  const prepareForSleep = useSleepStore((s) => s.prepareForSleep);

  const duration = latestSession?.durationMinutes ?? 0;
  const inDebt = debtMinutes > SLEEP_DEBT_WARNING_HOURS * 60;

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ borderColor: inDebt ? theme.warning : theme.border, backgroundColor: theme.backgroundElevated }}
    >
      <Pressable onPress={() => router.push('/slumber')} className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Moon size={15} color={theme.accent} />
          <ThemedText type="caption" tone="accent">
            THE SLUMBER
          </ThemedText>
        </View>
        <ChevronRight size={16} color={theme.textSecondary} />
      </Pressable>

      <View className="mt-2 flex-row items-end justify-between">
        <View>
          <ThemedText type="display" style={{ fontSize: 22 }}>
            {duration > 0 ? formatDuration(duration) : '—'}
          </ThemedText>
          <ThemedText type="caption" tone="secondary">
            {duration > 0 && latestSession ? `last night · ${formatClock(latestSession.sleepStart)}` : 'no sleep recorded'}
          </ThemedText>
        </View>
        {inDebt ? (
          <View className="items-end">
            <ThemedText type="mono" style={{ color: theme.warning }}>
              {formatDuration(debtMinutes)}
            </ThemedText>
            <ThemedText type="caption" tone="secondary">
              debt accrued
            </ThemedText>
          </View>
        ) : (
          <View className="items-end">
            <ThemedText type="mono" style={{ color: theme.success }}>
              {formatDuration(targetMinutes || SLEEP_TARGET_MINUTES_DEFAULT)}
            </ThemedText>
            <ThemedText type="caption" tone="secondary">
              target
            </ThemedText>
          </View>
        )}
      </View>

      {inDebt ? (
        <ThemedText type="small" tone="warning" className="mt-1">
          Debt accumulated: {formatDuration(debtMinutes)}. Catch up on rest.
        </ThemedText>
      ) : null}

      <View className="mt-3 flex-row gap-2">
        {activeSleepStart ? (
          <View className="flex-1 rounded-lg border px-3 py-2.5" style={{ borderColor: theme.accent, backgroundColor: theme.accentSoft }}>
            <ThemedText type="body" bold tone="accent" className="text-center">
              Resting since {formatClock(activeSleepStart)}
            </ThemedText>
          </View>
        ) : (
          <Pressable
            onPress={prepareForSleep}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5"
            style={{ borderColor: theme.border, backgroundColor: theme.backgroundSecondary }}
          >
            <Moon size={15} color={theme.textSecondary} />
            <ThemedText type="small" bold tone="secondary">
              Preparing for sleep
            </ThemedText>
          </Pressable>
        )}
        <Pressable
          onPress={() => markAwake()}
          className="flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-3 py-2.5"
          style={{ backgroundColor: theme.accent }}
        >
          <Check size={15} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
          <ThemedText type="small" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
            I am awake
          </ThemedText>
        </Pressable>
      </View>
      <ThemedText type="caption" tone="secondary" className="mt-2">
        Tap a signal to log sleep, or open The Slumber for full tracking.
      </ThemedText>
    </View>
  );
}
