import { Check } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { StreakFlame } from '@/components/habits/StreakFlame';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { HABIT_ICONS } from '@/constants/rituals';
import type { Habit } from '@/types';
import { formatRepeatPattern } from '@/utils/rituals';

export interface HabitCardProps {
  habit: Habit;
  completedToday: boolean;
  dueToday: boolean;
  fractured: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export function HabitCard({ habit, completedToday, dueToday, fractured, onToggle, onEdit }: HabitCardProps) {
  const { theme } = useAppTheme();
  const Icon = HABIT_ICONS[habit.icon] ?? HABIT_ICONS.flame;

  return (
    <Pressable
      onPress={onToggle}
      onLongPress={onEdit}
      className="rounded-xl border p-3"
      style={{
        borderColor: habit.isArchived ? theme.border : habit.color,
        backgroundColor: completedToday ? theme.accentSoft : theme.backgroundElevated,
        opacity: habit.isArchived ? 0.6 : 1,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 8,
            backgroundColor: theme.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={15} color={habit.isArchived ? theme.textSecondary : habit.color} />
        </View>
        <StreakFlame streak={habit.streak} fractured={fractured} />
      </View>

      <ThemedText type="body" bold numberOfLines={2} className="mt-2" style={{ color: habit.isArchived ? theme.textSecondary : theme.text }}>
        {habit.title}
      </ThemedText>
      <ThemedText type="caption" tone="secondary" numberOfLines={1} className="mt-0.5">
        {formatRepeatPattern(habit.repeatPattern)}
      </ThemedText>

      <View className="mt-2 flex-row items-center justify-between">
        <ThemedText type="caption" tone={dueToday ? 'accent' : 'secondary'} style={{ fontSize: 10 }}>
          {dueToday ? 'DUE TODAY' : 'NOT DUE'}
        </ThemedText>
        <View
          className="h-6 w-6 items-center justify-center rounded-full border"
          style={{
            borderColor: completedToday ? habit.color : theme.border,
            backgroundColor: completedToday ? habit.color : 'transparent',
          }}
        >
          {completedToday ? <Check size={14} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} /> : null}
        </View>
      </View>
    </Pressable>
  );
}
