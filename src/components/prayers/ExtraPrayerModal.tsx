import { useState } from 'react';
import { Modal } from 'react-native';
import { HandHeart, Minus, Plus, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { XP_EXTRA_PRAYER_PER_RAKAT, FAITH_EXTRA_PRAYER } from '@/constants/prayers';
import { awardXp } from '@/services/progression';

export interface ExtraPrayerModalProps {
  visible: boolean;
  onClose: () => void;
}

export function ExtraPrayerModal({ visible, onClose }: ExtraPrayerModalProps) {
  const { theme } = useAppTheme();
  const [rakats, setRakats] = useState(2);
  const [done, setDone] = useState(false);

  const xpReward = rakats * XP_EXTRA_PRAYER_PER_RAKAT;

  const confirm = async () => {
    await awardXp({
      module: 'sanctum',
      action: 'extra-prayer',
      entityId: `rakat-${rakats}`,
      xp: xpReward,
      statChanges: { faith: FAITH_EXTRA_PRAYER },
      metadata: { rakats },
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setDone(true);
    setTimeout(() => {
      setDone(false);
      onClose();
    }, 900);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <View className="rounded-t-3xl border-t p-6 pb-8" style={{ borderColor: theme.border, backgroundColor: theme.background }}>
          <View className="mb-5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <HandHeart size={18} color={theme.accent} />
              <ThemedText type="title">Nafl & Sunnah</ThemedText>
            </View>
            <Pressable onPress={onClose} style={{ padding: 4 }}>
              <X size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ThemedText type="small" tone="secondary" className="mb-5">
            Record extra voluntary prayers. Select the rakats and receive a reward for them.
          </ThemedText>

          <View className="mb-5 flex-row items-center justify-between">
            <ThemedText type="body">Number of rakats</ThemedText>
            <View className="flex-row items-center gap-2">
              <Pressable onPress={() => setRakats(Math.max(2, rakats - 1))} style={{ padding: 6 }}>
                <Minus size={20} color={theme.textSecondary} />
              </Pressable>
              <ThemedText type="mono" tone="accent" style={{ width: 30, textAlign: 'center', fontSize: 18 }}>
                {rakats}
              </ThemedText>
              <Pressable onPress={() => setRakats(Math.min(24, rakats + 1))} style={{ padding: 6 }}>
                <Plus size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          <View className="mb-6 rounded-xl border px-4 py-3" style={{ borderColor: theme.accent, backgroundColor: theme.accentSoft }}>
            <ThemedText type="caption" tone="accent">REWARD</ThemedText>
            <ThemedText type="mono" tone="accent" style={{ fontSize: 18 }}>
              +{xpReward} XP · +{FAITH_EXTRA_PRAYER} Faith
            </ThemedText>
          </View>

          <Pressable
            onPress={confirm}
            disabled={done}
            accessibilityRole="button"
            className="items-center rounded-xl py-3.5"
            style={({ pressed }) => ({ backgroundColor: theme.accent, opacity: pressed ? 0.85 : done ? 0.6 : 1 })}
          >
            <ThemedText type="body" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
              {done ? 'Recorded' : `Record ${rakats} rakats`}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
