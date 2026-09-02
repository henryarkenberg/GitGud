import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Exercise } from '@/types';

const MUSCLES: { name: string; subtypes: string[] }[] = [
  { name: 'Chest', subtypes: ['Bench press', 'Pushups'] },
  { name: 'Back', subtypes: ['Rows', 'Pullups', 'Deadlift'] },
  { name: 'Legs', subtypes: ['Squat', 'Deadlift', 'Brisk walk', 'Hike', '5k run', '10k run', 'Tempo run', 'Interval run'] },
  { name: 'Shoulders', subtypes: ['Overhead press'] },
  { name: 'Arms', subtypes: ['Pushups', 'Pullups'] },
  { name: 'Core', subtypes: ['Yoga', 'Mobility', 'Stretching'] },
];

export function BodyDiagram({ exercises }: { exercises: Exercise[] }) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row flex-wrap gap-2">
      {MUSCLES.map((m) => {
        const count = exercises.filter((e) => m.subtypes.some((s) => e.subtype.toLowerCase().includes(s.toLowerCase()))).length;
        const active = count > 0;
        return (
          <View
            key={m.name}
            className="rounded-lg border px-3 py-2"
            style={{
              borderColor: active ? theme.success : theme.border,
              backgroundColor: active ? theme.accentSoft : theme.backgroundElevated,
            }}
          >
            <ThemedText type="small" bold style={{ color: active ? theme.success : theme.textSecondary }}>
              {m.name}
            </ThemedText>
            <ThemedText type="caption" tone="secondary">
              {count} sessions
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}
