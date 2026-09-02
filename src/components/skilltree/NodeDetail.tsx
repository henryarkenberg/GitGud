import { Modal } from 'react-native';
import { X } from 'lucide-react-native';

import { SafeAreaView, ScrollView, View, Pressable } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { NODE_TYPE_LABELS, RARITY_META } from '@/constants/aetherium';
import type { SkillTreeNode } from '@/types';

export interface NodeDetailProps {
  visible: boolean;
  node: SkillTreeNode | null;
  sp: number;
  onClose: () => void;
  onUnlock: (node: SkillTreeNode) => void;
}

export function NodeDetail({ visible, node, sp, onClose, onUnlock }: NodeDetailProps) {
  const { theme } = useAppTheme();
  if (!node) return null;
  const meta = RARITY_META[node.rarity];
  const color = theme[meta.colorKey];

  const rewardText = node.rewards.stats
    ? Object.entries(node.rewards.stats).map(([k, v]) => `+${v} ${k}`).join(', ')
    : null;
  const cantAfford = sp < node.costSp;
  const reqMet = node.requirements.minStat === undefined;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <View className="rounded-t-3xl border-t" style={{ borderColor: color, backgroundColor: theme.background, maxHeight: '80%', overflow: 'hidden' }}>
          <SafeAreaView edges={['bottom']} className="px-5 pt-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-1">
                <ThemedText type="title" numberOfLines={1}>{node.name}</ThemedText>
                <View className="mt-1 flex-row items-center gap-2">
                  <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${color}1f` }}>
                    <ThemedText type="caption" style={{ color, fontSize: 9 }}>{meta.label}</ThemedText>
                  </View>
                  <ThemedText type="caption" tone="secondary">{NODE_TYPE_LABELS[node.nodeType]}</ThemedText>
                </View>
              </View>
              <Pressable onPress={onClose} style={{ padding: 4 }}>
                <X size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }} contentContainerClassName="pb-3">
              <View className="gap-3">
                <ThemedText type="small" tone="secondary">{node.description}</ThemedText>

                <View className="rounded-xl border px-4 py-3" style={{ borderColor: color, backgroundColor: `${color}14` }}>
                  <ThemedText type="caption" tone="accent">REWARD</ThemedText>
                  {rewardText ? (
                    <ThemedText type="body" bold style={{ color }}>
                      {rewardText}
                    </ThemedText>
                  ) : null}
                  {node.rewards.passive ? (
                    <ThemedText type="small" tone="secondary" className="mt-0.5">{node.rewards.passive}</ThemedText>
                  ) : null}
                  {node.rewards.ability ? (
                    <ThemedText type="small" tone="secondary" className="mt-0.5">{node.rewards.ability}</ThemedText>
                  ) : null}
                </View>

                {node.requirements.minStat ? (
                  <View className="rounded-xl border px-4 py-3" style={{ borderColor: theme.warning, backgroundColor: `${theme.warning}14` }}>
                    <ThemedText type="caption" tone="accent">REQUIREMENT</ThemedText>
                    <ThemedText type="small" tone="secondary" className="mt-0.5">
                      Needs {node.requirements.minStat} ≥ {node.requirements.minValue}
                    </ThemedText>
                  </View>
                ) : null}

                <View className="flex-row items-center justify-between">
                  <ThemedText type="small" tone="secondary">Related stat</ThemedText>
                  <ThemedText type="caption" tone="accent">{node.relatedStat}</ThemedText>
                </View>
              </View>
            </ScrollView>

            <View className="pb-6 pt-3">
              {node.isUnlocked ? (
                <Pressable className="items-center rounded-xl border py-3" style={{ borderColor: theme.success, backgroundColor: `${theme.success}14` }}>
                  <ThemedText type="body" bold style={{ color: theme.success }}>Unlocked</ThemedText>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => onUnlock(node)}
                  disabled={cantAfford || !reqMet}
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    borderRadius: 14,
                    paddingVertical: 14,
                    backgroundColor: theme.accent,
                    opacity: pressed ? 0.85 : cantAfford || !reqMet ? 0.5 : 1,
                  })}
                >
                  <ThemedText type="body" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
                    {cantAfford
                      ? `Need ${node.costSp} SP`
                      : !reqMet
                        ? 'Requirement not met'
                        : `Unlock · ${node.costSp} SP`}
                  </ThemedText>
                </Pressable>
              )}
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
