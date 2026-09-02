import { Modal } from 'react-native';
import { Sparkles } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useProgressionStore } from '@/stores/useProgressionStore';
import { MODULE_LABELS } from '@/constants/progression';

export function LevelUpModal() {
  const { theme } = useAppTheme();
  const levelUps = useProgressionStore((s) => s.levelUps);
  const drainLevelUp = useProgressionStore((s) => s.drainLevelUp);
  const event = levelUps[levelUps.length - 1];
  if (!event) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <Pressable
          onPress={() => drainLevelUp(event.id)}
          className="w-full items-center rounded-3xl border p-8"
          style={{ borderColor: theme.accent, backgroundColor: theme.backgroundElevated }}
        >
          <Sparkles size={46} color={theme.accent} />
          <ThemedText type="caption" tone="accent" className="mt-4">
            LEVEL UP
          </ThemedText>
          <ThemedText type="display" tone="accent" className="mt-1">
            {event.level}
          </ThemedText>
          <ThemedText type="small" tone="secondary" className="mt-2 text-center">
            {MODULE_LABELS[event.module] ?? event.module} forged your strength. You gain {event.spGained} Skill Points.
          </ThemedText>
          <View
            className="mt-6 rounded-full px-6 py-2"
            style={{ backgroundColor: theme.accent }}
          >
            <ThemedText type="body" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
              Continue
            </ThemedText>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}
