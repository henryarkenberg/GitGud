import { useState } from 'react';
import { Minus, Plus, Sparkles } from 'lucide-react-native';

import { SafeAreaView, View, Pressable } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useSkillTreeStore } from '@/stores/useSkillTreeStore';
import { useUserStore } from '@/stores/useUserStore';
import { TreeCanvas } from '@/components/skilltree/TreeCanvas';
import { NodeDiscovery } from '@/components/skilltree/NodeDiscovery';
import { NodeDetail } from '@/components/skilltree/NodeDetail';
import { UnlockAnimation } from '@/components/skilltree/UnlockAnimation';
import { RARITY_META, DISCOVERY_SP_COST, REROLL_GOLD_COST } from '@/constants/aetherium';
import type { SkillTreeNode } from '@/types';

const RARITIES = ['common', 'rare', 'epic', 'legendary'] as const;

export default function AetheriumScreen() {
  const { theme } = useAppTheme();
  const nodes = useSkillTreeStore((s) => s.nodes);
  const connections = useSkillTreeStore((s) => s.connections);
  const options = useSkillTreeStore((s) => s.options);
  const discoveryOpen = useSkillTreeStore((s) => s.discoveryOpen);
  const message = useSkillTreeStore((s) => s.message);
  const discover = useSkillTreeStore((s) => s.discover);
  const reRoll = useSkillTreeStore((s) => s.reRoll);
  const selectOption = useSkillTreeStore((s) => s.selectOption);
  const cancelDiscovery = useSkillTreeStore((s) => s.cancelDiscovery);
  const unlock = useSkillTreeStore((s) => s.unlock);
  const profile = useUserStore((s) => s.profile);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [unlockNotice, setUnlockNotice] = useState<string | null>(null);

  const selected = selectedId ? nodes.find((n) => n.id === selectedId) ?? null : null;
  const sp = profile?.skillPoints ?? 0;
  const gold = profile?.gold ?? 0;
  const awakened = nodes.filter((n) => n.isUnlocked).length;
  const canDiscover = sp >= DISCOVERY_SP_COST;

  const tryUnlock = async (node: SkillTreeNode) => {
    const err = await unlock(node.id);
    if (err) return;
    setUnlockNotice(node.name);
    setSelectedId(null);
  };

  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 px-4" edges={['top']}>
        <View className="mb-4">
          <ThemedText type="caption" tone="accent">YOUR PATH IS YOURS ALONE</ThemedText>
          <ThemedText type="display" className="mt-0.5">The Aetherium</ThemedText>
          <ThemedText type="small" tone="secondary" className="mt-1">
            Discover and unlock nodes to make your character unique.
          </ThemedText>
        </View>

        {/* Stats */}
        <View className="mb-3 flex-row gap-2">
          <View className="flex-1 rounded-2xl border px-3 py-2.5" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <ThemedText type="caption" tone="secondary">SKILL POINTS</ThemedText>
            <ThemedText type="mono" tone="accent" style={{ fontSize: 17 }}>{sp}</ThemedText>
          </View>
          <View className="flex-1 rounded-2xl border px-3 py-2.5" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <ThemedText type="caption" tone="secondary">GOLD</ThemedText>
            <ThemedText type="mono" tone="secondary" style={{ fontSize: 17 }}>{gold}</ThemedText>
          </View>
          <View className="flex-1 rounded-2xl border px-3 py-2.5" style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}>
            <ThemedText type="caption" tone="secondary">AWAKENED</ThemedText>
            <ThemedText type="mono" tone="accent" style={{ fontSize: 17 }}>{awakened}/{nodes.length}</ThemedText>
          </View>
        </View>

        {/* Discover */}
        <Pressable
          onPress={() => { setSelectedId(null); discover(); }}
          disabled={!canDiscover}
          accessibilityRole="button"
          style={({ pressed }) => ({
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 16,
            paddingVertical: 15,
            backgroundColor: theme.accent,
            opacity: pressed ? 0.85 : canDiscover ? 1 : 0.5,
          })}
        >
          <Sparkles size={18} color={theme.name === 'dark' ? '#0B0F19' : '#FFFFFF'} />
          <ThemedText type="body" bold style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
            {canDiscover ? `Discover Next Node · ${DISCOVERY_SP_COST} SP` : `Need ${DISCOVERY_SP_COST} SP to Discover`}
          </ThemedText>
        </Pressable>

        {/* Tree */}
        <View
          className="mb-3 flex-1 overflow-hidden rounded-2xl border"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.backgroundElevated,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <TreeCanvas
            nodes={nodes}
            connections={connections}
            zoom={zoom}
            selectedId={selectedId}
            onSelect={(n) => setSelectedId(n.id)}
          />
          {/* Zoom controls */}
          <View
            style={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.backgroundElevated,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Pressable onPress={() => setZoom(Math.max(0.6, zoom - 0.2))} style={{ padding: 3 }}>
              <Minus size={16} color={theme.textSecondary} />
            </Pressable>
            <ThemedText type="caption" tone="secondary" style={{ width: 36, textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </ThemedText>
            <Pressable onPress={() => setZoom(Math.min(2, zoom + 0.2))} style={{ padding: 3 }}>
              <Plus size={16} color={theme.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Legend */}
        <View className="mb-3 flex-row items-center justify-center gap-3">
          {RARITIES.map((r) => (
            <View key={r} className="flex-row items-center gap-1.5">
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme[RARITY_META[r].colorKey] }} />
              <ThemedText type="caption" tone="secondary" style={{ fontSize: 10 }}>{RARITY_META[r].label}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedText type="caption" tone="secondary" className="mb-2 text-center">
          Tap a node for details · {nodes.length} nodes · {awakened} awakened
        </ThemedText>
      </SafeAreaView>

      <NodeDiscovery
        visible={discoveryOpen}
        options={options}
        spAvailable={sp}
        gold={gold}
        costSp={DISCOVERY_SP_COST}
        reRollCostGold={REROLL_GOLD_COST}
        message={message}
        onSelect={selectOption}
        onReroll={reRoll}
        onCancel={cancelDiscovery}
      />

      <NodeDetail
        visible={selected !== null}
        node={selected}
        sp={sp}
        onClose={() => setSelectedId(null)}
        onUnlock={tryUnlock}
      />

      <UnlockAnimation active={unlockNotice !== null} name={unlockNotice} onFinish={() => setUnlockNotice(null)} />
    </ThemedView>
  );
}
