import { Check } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { DailyQuest, DailyQuestCategory, StatName } from '@/types';

const CATEGORY_TONE: Record<DailyQuestCategory, 'success' | 'info' | 'warning' | 'danger' | 'accent'> = {
  prayer: 'accent',
  sleep: 'info',
  project: 'warning',
  fitness: 'success',
  relation: 'danger',
  habit: 'info',
};

export interface DailyQuestCardProps {
  quest: DailyQuest;
  onToggle: (id: string) => void;
}

export function DailyQuestCard({ quest, onToggle }: DailyQuestCardProps) {
  const { theme } = useAppTheme();
  const done = quest.isCompleted;
  const tone = CATEGORY_TONE[quest.category];

  return (
    <Pressable
      onPress={() => onToggle(quest.id)}
      className="flex-row items-center gap-3 rounded-xl border px-4 py-3"
      style={{ borderColor: done ? theme.success : theme.border, backgroundColor: done ? theme.accentSoft : theme.backgroundElevated }}
    >
      <View
        className="h-6 w-6 items-center justify-center rounded-full border"
        style={{ borderColor: done ? theme.success : theme.border, backgroundColor: done ? theme.success : 'transparent' }}
      >
        {done ? <Check size={14} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} /> : null}
      </View>
      <View className="flex-1">
        <ThemedText type="body" bold style={{ textDecorationLine: done ? 'line-through' : 'none', color: done ? theme.textSecondary : theme.text }}>
          {quest.title}
        </ThemedText>
        {quest.description ? (
          <ThemedText type="small" tone="secondary" className="mt-0.5">
            {quest.description}
          </ThemedText>
        ) : null}
        <View className="mt-1 flex-row flex-wrap items-center gap-1.5">
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }}>
            <ThemedText type="caption" tone={tone} style={{ fontSize: 9 }}>
              {quest.category}
            </ThemedText>
          </View>
          <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }}>
            <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
              {quest.difficulty}
            </ThemedText>
          </View>
          <ThemedText type="caption" tone="accent" style={{ fontSize: 10 }}>
            +{quest.xpReward} XP · {quest.relatedStat as StatName}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}
