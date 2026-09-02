import { CircleCheckBig, CircleDashed, CircleX, Clock4 } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { PRAYER_META } from '@/constants/prayers';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { PrayerName, PrayerStatus } from '@/types';
import { formatPrayerTime } from '@/utils/prayerTimes';

export interface PrayerPillarProps {
  name: PrayerName;
  time: Date;
  status: PrayerStatus;
  onPress: () => void;
  onMissed: () => void;
}

const STATUS_ICONS = {
  pending: CircleDashed,
  'on-time': CircleCheckBig,
  late: Clock4,
  missed: CircleX,
} as const;

export function PrayerPillar({ name, time, status, onPress, onMissed }: PrayerPillarProps) {
  const { theme } = useAppTheme();
  const meta = PRAYER_META[name];
  const StatusIcon = STATUS_ICONS[status];

  const filled = status === 'on-time' || status === 'late';
  const fillColor = status === 'on-time' ? theme.accent : theme.warning;
  const onFill = theme.name === 'dark' ? '#0B0F19' : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onMissed}
      className="flex-1 items-center justify-between rounded-2xl border py-3"
      style={{
        borderColor: filled ? fillColor : status === 'missed' ? theme.border : theme.accent,
        backgroundColor: filled
          ? fillColor
          : status === 'missed'
            ? theme.background
            : theme.backgroundElevated,
        height: 190,
        opacity: status === 'missed' ? 0.55 : 1,
        shadowColor: status === 'pending' ? theme.accent : 'transparent',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 0 },
        elevation: status === 'pending' ? 4 : 0,
      }}
    >
      <View className="items-center gap-0.5">
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 38,
            height: 38,
            backgroundColor: filled ? 'transparent' : theme.backgroundSecondary,
            borderWidth: 1,
            borderColor: filled ? 'transparent' : theme.border,
          }}
        >
          <meta.icon size={18} color={filled ? onFill : theme.textSecondary} />
        </View>
        <ThemedText
          type="mono"
          style={{
            fontSize: 14,
            color: filled ? onFill : status === 'missed' ? theme.textSecondary : theme.text,
          }}
        >
          {formatPrayerTime(time)}
        </ThemedText>
        <ThemedText
          type="caption"
          style={{ color: filled ? onFill : theme.textSecondary }}
        >
          {meta.label}
        </ThemedText>
      </View>

      <StatusIcon
        size={16}
        color={filled ? onFill : status === 'missed' ? theme.danger : theme.accent}
      />
    </Pressable>
  );
}