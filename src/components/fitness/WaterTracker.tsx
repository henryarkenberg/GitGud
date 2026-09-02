import { Droplets, RotateCcw } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { WATER_GOAL } from '@/constants/fitness';

export interface WaterTrackerProps {
  glasses: number;
  onAdd: () => void;
  onReset: () => void;
}

export function WaterTracker({ glasses, onAdd, onReset }: WaterTrackerProps) {
  const { theme } = useAppTheme();
  const ratio = Math.min(1, glasses / WATER_GOAL);

  return (
    <Pressable
      onPress={onAdd}
      className="rounded-2xl border p-4"
      style={{ borderColor: theme.info, backgroundColor: theme.backgroundElevated }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Droplets size={16} color={theme.info} />
          <ThemedText type="caption" tone="accent">
            HYDRATION
          </ThemedText>
        </View>
        <Pressable onPress={onReset} style={{ padding: 4 }}>
          <RotateCcw size={14} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View className="mt-2 flex-row items-end justify-between">
        <ThemedText type="display" tone="info" style={{ fontSize: 26 }}>
          {glasses}
          <ThemedText type="display" tone="secondary" style={{ fontSize: 26 }}>
            /{WATER_GOAL}
          </ThemedText>
        </ThemedText>
        <ThemedText type="small" tone="secondary">
          tap to drink
        </ThemedText>
      </View>

      <View className="mt-3 flex-row gap-1">
        {Array.from({ length: WATER_GOAL }).map((_, i) => (
          <View
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: 26,
              backgroundColor: i < glasses ? theme.info : theme.background,
              borderColor: theme.border,
              borderWidth: 1,
            }}
          />
        ))}
      </View>

      {glasses >= WATER_GOAL ? (
        <ThemedText type="caption" tone="success" className="mt-2">
          Goal reached. The vessel is full.
        </ThemedText>
      ) : null}

      <View style={{ height: 2, marginTop: 8, backgroundColor: theme.background }}>
        <View style={{ width: `${ratio * 100}%`, height: 2, backgroundColor: theme.info }} />
      </View>
    </Pressable>
  );
}
