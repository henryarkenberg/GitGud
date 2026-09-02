import { Flame } from 'lucide-react-native';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface PrayerSummaryProps {
  done: number;
  total: number;
  onTime: number;
  late: number;
  missed: number;
}

export function PrayerSummary({ done, total, onTime, late, missed }: PrayerSummaryProps) {
  const { theme } = useAppTheme();
  const perfect = onTime === total && total > 0;

  return (
    <View
      className="rounded-2xl border p-4"
      style={{
        borderColor: perfect ? theme.accent : theme.border,
        backgroundColor: theme.backgroundElevated,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <ThemedText type="caption" tone="accent">
          THE SANCTUM
        </ThemedText>
        {perfect ? (
          <View className="flex-row items-center gap-1">
            <Flame size={13} color={theme.accent} />
            <ThemedText type="caption" bold style={{ color: theme.accent }}>
              PERFECT DAY
            </ThemedText>
          </View>
        ) : null}
      </View>

      <View className="flex-row items-end justify-between">
        <ThemedText type="display" style={{ fontSize: 26 }}>
          {done}
          <ThemedText type="display" tone="secondary" style={{ fontSize: 26 }}>
            /{total}
          </ThemedText>
        </ThemedText>
        <ThemedText type="small" tone="secondary">
          prayers today
        </ThemedText>
      </View>

      <View className="mt-3 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.background }}>
        <View
          style={{
            width: `${(done / Math.max(1, total)) * 100}%`,
            height: '100%',
            backgroundColor: theme.accent,
            borderRadius: 999,
          }}
        />
      </View>

      <View className="mt-2 flex-row justify-between">
        <ThemedText type="caption" tone="secondary">
          {onTime} on-time
        </ThemedText>
        <ThemedText type="caption" tone="secondary">
          {late} late
        </ThemedText>
        <ThemedText type="caption" tone="secondary">
          {missed} missed
        </ThemedText>
      </View>
    </View>
  );
}