import { Flame } from 'lucide-react-native';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface StreakBannerProps {
  current: number;
  longest: number;
}

export function StreakBanner({ current, longest }: StreakBannerProps) {
  const { theme } = useAppTheme();
  const color = current > 0 ? theme.accent : theme.textSecondary;

  return (
    <View
      className="flex-row items-center justify-between rounded-2xl border px-4 py-3"
      style={{
        borderColor: current > 0 ? theme.accent : theme.border,
        backgroundColor: theme.backgroundElevated,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <View className="flex-row items-center gap-2">
        <Flame size={18} color={color} fill={current > 0 ? theme.accentSoft : 'none'} />
        <View>
          <ThemedText type="caption" tone="accent">DAY STREAK</ThemedText>
          <ThemedText type="body" bold style={{ color: current > 0 ? theme.accent : theme.textSecondary }}>
            {current} day{current === 1 ? '' : 's'}
          </ThemedText>
        </View>
      </View>
      <View className="items-end">
        <ThemedText type="mono" tone="accent">{longest}</ThemedText>
        <ThemedText type="caption" tone="secondary">longest</ThemedText>
      </View>
    </View>
  );
}
