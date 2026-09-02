import { Check, Dices, X } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { RandomEventData } from '@/types';

export interface RandomEventCardProps {
  event: RandomEventData;
  onComplete: () => void;
  onDismiss: () => void;
}

export function RandomEventCard({ event, onComplete, onDismiss }: RandomEventCardProps) {
  const { theme } = useAppTheme();

  return (
    <View className="rounded-2xl border p-4" style={{ borderColor: theme.warning, backgroundColor: theme.accentSoft }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Dices size={16} color={theme.warning} />
          <ThemedText type="caption" tone="accent">
            CHANCE ENCOUNTER
          </ThemedText>
        </View>
        <Pressable onPress={onDismiss} style={{ padding: 4 }}>
          <X size={16} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ThemedText type="body" bold className="mt-2">
        {event.title}
      </ThemedText>
      <ThemedText type="small" tone="secondary" className="mt-1">
        {event.description}
      </ThemedText>

      <View className="mt-3 flex-row items-center justify-between">
        <ThemedText type="caption" tone="accent">
          +{event.xpReward} XP · {event.statFocus}
        </ThemedText>
        <Pressable
          onPress={onComplete}
          className="flex-row items-center gap-1.5 rounded-lg px-3 py-2"
          style={{ backgroundColor: theme.accent }}
        >
          <Check size={14} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
          <ThemedText type="caption" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
            Seize it
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}
