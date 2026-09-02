import { Modal } from 'react-native';
import { Dices, Sparkles } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { NODE_TYPE_LABELS, RARITY_META } from '@/constants/aetherium';
import type { NodeOption } from '@/types';

export interface NodeDiscoveryProps {
  visible: boolean;
  options: NodeOption[];
  spAvailable: number;
  gold: number;
  costSp: number;
  reRollCostGold: number;
  message: string | null;
  onSelect: (option: NodeOption) => void;
  onReroll: () => void;
  onCancel: () => void;
}

export function NodeDiscovery({ visible, options, spAvailable, gold, costSp, reRollCostGold, message, onSelect, onReroll, onCancel }: NodeDiscoveryProps) {
  const { theme } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 justify-center px-5" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
        <View className="rounded-3xl border p-5" style={{ borderColor: theme.borderFocus, backgroundColor: theme.backgroundElevated }}>
          <View className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color={theme.accent} />
              <ThemedText type="title">Discover</ThemedText>
            </View>
            <ThemedText type="caption" tone="accent">{spAvailable} SP</ThemedText>
          </View>

          <ThemedText type="small" tone="secondary" className="mb-3">
            Choose the node that will manifest on your tree. ({costSp} SP already spent)
          </ThemedText>

          <View className="gap-2">
            {options.map((o) => {
              const meta = RARITY_META[o.rarity];
              const color = theme[meta.colorKey];
              return (
                <Pressable
                  key={o.id}
                  onPress={() => onSelect(o)}
                  className="flex-row items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ borderColor: color, backgroundColor: theme.background }}
                >
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.accentSoft, borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
                    <ThemedText type="title" style={{ color, fontSize: 16 }}>{o.name[0]?.toUpperCase()}</ThemedText>
                  </View>
                  <View className="flex-1">
                    <ThemedText type="body" bold>{o.name}</ThemedText>
                    <ThemedText type="caption" tone="secondary">{NODE_TYPE_LABELS[o.nodeType]} · {meta.label} · {o.costSp} SP</ThemedText>
                    <ThemedText type="caption" tone="secondary" style={{ fontSize: 10 }}>{o.description}</ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {message ? <ThemedText type="small" tone="danger" className="mt-2">{message}</ThemedText> : null}

          <View className="mt-4 flex-row gap-2">
            <Pressable onPress={onReroll} className="flex-1 flex-row items-center justify-center gap-1 rounded-lg border px-3 py-2" style={{ borderColor: theme.border }}>
              <Dices size={14} color={theme.accent} />
              <ThemedText type="caption" tone="accent">Re-roll ({reRollCostGold}G)</ThemedText>
            </Pressable>
            <Pressable onPress={onCancel} className="flex-1 items-center justify-center rounded-lg border px-3 py-2" style={{ borderColor: theme.border }}>
              <ThemedText type="caption" tone="secondary">Cancel</ThemedText>
            </Pressable>
          </View>
          <ThemedText type="caption" tone="secondary" className="mt-2">
            You have {gold} gold. Re-rolling leaves the tree to fate.
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}
