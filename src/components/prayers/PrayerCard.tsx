import { Check } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { PRAYER_META } from '@/constants/prayers';
import type { PrayerName, PrayerStatus } from '@/types';
import { formatTimespan } from '@/utils/prayerTimes';

const GREEN = '#22C55E';

export interface PrayerCardProps {
  name: PrayerName;
  time: Date;
  windowEnd: Date;
  status: PrayerStatus;
  now: Date;
  width: number;
  onPress: () => void;
}

export function PrayerCard({
  name,
  time,
  windowEnd,
  status,
  now,
  width,
  onPress,
}: PrayerCardProps) {
  const { theme } = useAppTheme();
  const meta = PRAYER_META[name];
  const color = meta.color;

  const started = now.getTime() >= time.getTime();
  const inWindow = now.getTime() <= windowEnd.getTime();
  const prayed = status === 'on-time' || status === 'late';
  const missed = status === 'missed';

  const detail = prayed
    ? status === 'on-time'
      ? 'on time'
      : 'late'
    : missed
      ? 'Qada'
      : started && inWindow
        ? 'Now'
        : !started
          ? `in ${formatTimespan(time.getTime() - now.getTime())}`
          : 'Overdue';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${meta.label} prayer`}
      style={({ pressed }) => ({
        width,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: `${color}14`,
        overflow: 'hidden',
        minHeight: 208,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      {/* Watermark icon — large, top-right, half off the card */}
      <View style={{ position: 'absolute', right: -50, top: -30 }}>
        <meta.icon size={208} color={`${color}22`} />
      </View>

      {/* Content */}
      <View style={{ padding: 20, flex: 1 }}>
        <View className="mb-2 flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <ThemedText type="title" numberOfLines={1} adjustsFontSizeToFit style={{ color, fontSize: 24 }}>
              {meta.label}
            </ThemedText>
            <ThemedText type="caption" tone="secondary">{meta.subtitle}</ThemedText>
          </View>
          {prayed ? (
            <View className="h-6 w-6 items-center justify-center rounded-full" style={{ backgroundColor: GREEN }}>
              <Check size={14} color="#FFFFFF" />
            </View>
          ) : null}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <ThemedText type="small" tone="secondary" numberOfLines={2} style={{ lineHeight: 16 }}>
              {meta.reason}
            </ThemedText>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <ThemedText type="body" bold style={{ color: prayed ? GREEN : theme.textSecondary }}>
            {prayed ? 'Prayed' : 'Not Prayed Yet'}
          </ThemedText>
          <ThemedText type="caption" tone="secondary" style={{ fontSize: 10 }}>
            {detail}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}
