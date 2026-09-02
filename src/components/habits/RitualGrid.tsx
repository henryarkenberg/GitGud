import { Plus } from 'lucide-react-native';

import { View } from '@/components/tw';
import { HabitCard } from '@/components/habits/HabitCard';
import { Button } from '@/components/ui/Button';
import { ThemedText } from '@/components/ui/ThemedText';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Habit, HabitLog } from '@/types';
import { dayKey, isHabitDueOn, isHabitFractured } from '@/utils/rituals';

export interface RitualGridProps {
  habits: Habit[];
  logs: HabitLog[];
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onAdd: () => void;
}

export function RitualGrid({ habits, logs, onToggle, onEdit, onAdd }: RitualGridProps) {
  const { theme } = useAppTheme();
  const today = new Date();
  const todayKey = dayKey(today);
  const showsDue = habits.filter((h) => !h.isArchived && isHabitDueOn(h, today));
  const completedForToday = new Set(logs.filter((l) => l.completed && l.date === todayKey).map((l) => l.habitId));

  return (
    <View>
      <SectionHeader
        title="RITUALS · TODAY"
        right={
          <Button variant="ghost" shape="sharp" size="sm" onPress={onAdd}>
            <Plus size={14} color={theme.accent} />
            New
          </Button>
        }
      />

      {showsDue.length === 0 ? (
        <View className="rounded-xl border px-4 py-4" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
          <ThemedText type="small" tone="secondary">
            Nothing due today. Craft a ritual to begin forging your discipline.
          </ThemedText>
        </View>
      ) : (
        <View className="flex-row flex-wrap justify-between" style={{ rowGap: 10 }}>
          {showsDue.map((habit) => (
            <View key={habit.id} style={{ width: '48.5%' }}>
              <HabitCard
                habit={habit}
                completedToday={completedForToday.has(habit.id)}
                dueToday
                fractured={isHabitFractured(habit, logs.some((l) => l.habitId === habit.id), habit.streak)}
                onToggle={() => onToggle(habit.id)}
                onEdit={() => onEdit(habit)}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
