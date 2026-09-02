import { router } from 'expo-router';
import { Check, ChevronRight, ScrollText } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useHabitStore } from '@/stores/useHabitStore';
import { dayKey, isHabitDueOn } from '@/utils/rituals';

export function RitualsTodayCard() {
  const { theme } = useAppTheme();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const todayKey = dayKey(new Date());

  const due = habits.filter((h) => !h.isArchived && isHabitDueOn(h, new Date()));
  const done = due.filter((h) => logs.some((l) => l.habitId === h.id && l.date === todayKey && l.completed)).length;

  return (
    <Pressable
      onPress={() => router.push('/rituals')}
      className="rounded-2xl border p-4"
      style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <ScrollText size={15} color={theme.accent} />
          <ThemedText type="caption" tone="accent">
            TODAY&apos;S RITUALS
          </ThemedText>
        </View>
        <ChevronRight size={16} color={theme.textSecondary} />
      </View>

      <View className="mt-2 flex-row items-end justify-between">
        <View>
          <ThemedText type="display" style={{ fontSize: 22 }}>
            {done}
            <ThemedText type="display" tone="secondary" style={{ fontSize: 22 }}>
              /{due.length}
            </ThemedText>
          </ThemedText>
          <ThemedText type="caption" tone="secondary">
            rituals done today
          </ThemedText>
        </View>
        <View className="items-end">
          {due.length > 0 ? (
            <View className="flex-row items-center gap-1">
              <Check size={14} color={done === due.length && due.length > 0 ? theme.success : theme.accent} />
              <ThemedText type="mono" tone="accent">
                {done === due.length && due.length > 0 ? 'CLEARED' : `${due.length - done} left`}
              </ThemedText>
            </View>
          ) : (
            <ThemedText type="caption" tone="secondary">
              none due
            </ThemedText>
          )}
        </View>
      </View>
    </Pressable>
  );
}
