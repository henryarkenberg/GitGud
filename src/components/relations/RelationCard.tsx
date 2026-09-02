import { ChevronRight } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { HealthBar } from '@/components/relations/HealthBar';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { RELATION_TYPE_LABELS } from '@/constants/relations';
import type { Relation } from '@/types';

export interface RelationCardProps {
  relation: Relation;
  onOpen: () => void;
}

export function RelationCard({ relation, onOpen }: RelationCardProps) {
  const { theme } = useAppTheme();
  const estranged = relation.health <= 0;

  return (
    <Pressable
      onPress={onOpen}
      className="rounded-xl border p-4"
      style={{ borderColor: estranged ? theme.danger : theme.border, backgroundColor: theme.backgroundElevated }}
    >
      <View className="flex-row items-center gap-3">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: estranged ? theme.danger : theme.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThemedText type="title" style={{ color: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF' }}>
            {relation.name[0]?.toUpperCase() ?? '?'}
          </ThemedText>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <ThemedText type="body" bold numberOfLines={1}>
              {relation.name}
            </ThemedText>
            <ThemedText type="caption" tone="secondary" style={{ fontSize: 9 }}>
              {RELATION_TYPE_LABELS[relation.relationType]}
            </ThemedText>
          </View>
          <ThemedText type="small" tone="secondary" className="mt-0.5">
            Level {relation.level} · {relation.xp} XP
          </ThemedText>
          <View className="mt-1.5">
            <HealthBar health={relation.health} maxHealth={relation.maxHealth} />
          </View>
        </View>
        <ChevronRight size={16} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}
