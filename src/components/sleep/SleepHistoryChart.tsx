import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { dailyDurationByEnd, formatDuration } from '@/utils/sleep';
import type { SleepSession } from '@/types';

export interface SleepHistoryChartProps {
  sessions: SleepSession[];
  targetMinutes: number;
  days?: number;
}

function weekdayLabel(dateKey: string): string {
  const d = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d).slice(0, 2);
}

export function SleepHistoryChart({ sessions, targetMinutes, days = 7 }: SleepHistoryChartProps) {
  const { theme } = useAppTheme();
  const data = dailyDurationByEnd(sessions, days);
  const maxDuration = Math.max(targetMinutes, ...data.map((d) => d.minutes), 1);
  const heightFor = (minutes: number) => Math.max(8, (minutes / maxDuration) * 72);

  return (
    <View className="gap-3">
      <View className="flex-row items-end justify-between" style={{ height: 72 }}>
        {data.map((d, i) => {
          const isToday = i === data.length - 1;
          const over = d.minutes >= targetMinutes;
          return (
            <View key={d.date} className="flex-1 items-center">
              <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
                {d.minutes > 0 ? formatDuration(d.minutes) : ''}
              </ThemedText>
              <View
                className="mt-1 w-6 rounded-t-sm"
                style={{
                  height: heightFor(d.minutes),
                  backgroundColor: isToday ? theme.accent : over ? theme.info : theme.textSecondary,
                  opacity: d.minutes > 0 ? 0.9 : 0.25,
                }}
              />
            </View>
          );
        })}
      </View>
      <View className="flex-row">
        {data.map((d, i) => (
          <View key={d.date} className="flex-1 items-center">
            <ThemedText
              type="caption"
              tone="secondary"
              style={{ color: i === data.length - 1 ? theme.accent : theme.textSecondary, fontSize: 10 }}
            >
              {weekdayLabel(d.date)}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}
