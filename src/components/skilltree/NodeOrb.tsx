import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RARITY_META } from '@/constants/aetherium';
import type { SkillTreeNode } from '@/types';

const SIZES = { common: 44, rare: 54, epic: 64, legendary: 76 };

export interface NodeOrbProps {
  node: SkillTreeNode;
  selected: boolean;
  onPress: () => void;
}

export function NodeOrb({ node, selected, onPress }: NodeOrbProps) {
  const { theme } = useAppTheme();
  const meta = RARITY_META[node.rarity];
  const color = theme[meta.colorKey];
  const size = SIZES[node.rarity];
  const locked = !node.isUnlocked;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={node.name} style={{ alignItems: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: locked ? theme.backgroundSecondary : theme.accentSoft,
          borderWidth: selected ? 3 : 2,
          borderColor: locked ? theme.border : color,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: locked ? 0.7 : 1,
          shadowColor: locked ? 'transparent' : color,
          shadowOpacity: 0.6,
          shadowRadius: selected ? 14 : 8,
          elevation: selected ? 8 : 4,
        }}
      >
        <ThemedText type="title" style={{ color: locked ? theme.textSecondary : color, fontSize: size > 60 ? 22 : 18 }}>
          {node.name[0]?.toUpperCase() ?? '?'}
        </ThemedText>
      </View>
      <ThemedText
        type="caption"
        tone="secondary"
        numberOfLines={1}
        style={{ fontSize: 9, marginTop: 4, maxWidth: 96, textAlign: 'center', color: locked ? theme.textSecondary : theme.text }}
      >
        {node.name}
      </ThemedText>
    </Pressable>
  );
}
