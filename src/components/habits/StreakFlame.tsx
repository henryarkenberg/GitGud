import { Flame } from 'lucide-react-native';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { STREAK_RENEWAL_DAYS } from '@/constants/rituals';

export interface StreakFlameProps {
  streak: number;
  fractured?: boolean;
}

export function StreakFlame({ streak, fractured = false }: StreakFlameProps) {
  const { theme } = useAppTheme();
  const color = fractured ? theme.warning : streak > 0 ? theme.accent : theme.border;
  const size = Math.min(34, 16 + streak * 2);
  const healing = fractured && streak > 0;

  return (
    <View className="items-center" style={{ minWidth: 34 }}>
      <Flame size={size} color={color} fill={streak > 0 && !fractured ? theme.accentSoft : 'none'} />
      <ThemedText type="mono" style={{ color, fontSize: 12 }}>
        {streak}
      </ThemedText>
      {fractured ? (
        <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
          {healing ? `heal ${streak}/${STREAK_RENEWAL_DAYS}` : 'broken'}
        </ThemedText>
      ) : null}
    </View>
  );
}
