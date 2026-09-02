import { ScrollView, View } from 'react-native';
import { useMemo } from 'react';

import { ConnectionLine } from '@/components/skilltree/ConnectionLine';
import { NodeOrb } from '@/components/skilltree/NodeOrb';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RARITY_META } from '@/constants/aetherium';
import type { SkillTreeNode } from '@/types';

const PAD = 130;

export interface TreeCanvasProps {
  nodes: SkillTreeNode[];
  connections: { id: string; fromNodeId: string; toNodeId: string }[];
  zoom: number;
  selectedId: string | null;
  onSelect: (node: SkillTreeNode) => void;
}

export function TreeCanvas({ nodes, connections, zoom, selectedId, onSelect }: TreeCanvasProps) {
  const { theme } = useAppTheme();

  const layout = useMemo(() => {
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    for (const n of nodes) {
      minX = Math.min(minX, n.positionX);
      maxX = Math.max(maxX, n.positionX);
      minY = Math.min(minY, n.positionY);
      maxY = Math.max(maxY, n.positionY);
    }
    const spanX = Math.max(900, maxX - minX + PAD * 2);
    const spanY = Math.max(900, maxY - minY + PAD * 2);
    return { minX, minY, spanX, spanY };
  }, [nodes]);

  const contentW = layout.spanX * zoom;
  const contentH = layout.spanY * zoom;

  const posById = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>();
    for (const n of nodes) {
      m.set(n.id, {
        x: (n.positionX - layout.minX + PAD) * zoom,
        y: (n.positionY - layout.minY + PAD) * zoom,
      });
    }
    return m;
  }, [nodes, zoom, layout]);

  return (
    <ScrollView
      horizontal
      style={{ flex: 1 }}
      contentContainerStyle={{ width: contentW, height: contentH }}
      showsHorizontalScrollIndicator
      showsVerticalScrollIndicator
    >
      <View style={{ position: 'relative', width: contentW, height: contentH }}>
        {connections.map((c) => {
          const a = posById.get(c.fromNodeId);
          const b = posById.get(c.toNodeId);
          if (!a || !b) return null;
          const from = nodes.find((n) => n.id === c.fromNodeId);
          return (
            <ConnectionLine
              key={c.id}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              active={!!from?.isUnlocked}
              color={theme[RARITY_META[from?.rarity ?? 'common'].colorKey]}
            />
          );
        })}

        {nodes.map((n) => {
          const p = posById.get(n.id);
          if (!p) return null;
          return (
            <View key={n.id} style={{ position: 'absolute', left: p.x - 70, top: p.y - 70, width: 140, alignItems: 'center' }}>
              <NodeOrb node={n} selected={selectedId === n.id} onPress={() => onSelect(n)} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
