import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Relation } from '@/types';

export interface ConstellationMapProps {
  relations: Relation[];
  onOpen: (id: string) => void;
}

export function ConstellationMap({ relations, onOpen }: ConstellationMapProps) {
  const { theme } = useAppTheme();

  return (
    <View className="flex-row flex-wrap justify-between" style={{ rowGap: 12 }}>
      {relations.map((r) => {
        const ratio = r.maxHealth > 0 ? Math.max(0, r.health) / r.maxHealth : 0;
        const size = 34 + Math.round(ratio * 26);
        const color = ratio < 0.4 ? theme.danger : ratio < 0.7 ? theme.warning : theme.info;
        return (
          <Pressable key={r.id} onPress={() => onOpen(r.id)} className="items-center" style={{ width: '31%' }}>
            <View
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: theme.accentSoft,
                borderWidth: 2,
                borderColor: color,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0.4 + ratio * 0.6,
              }}
            >
              <ThemedText type="body" bold style={{ color: theme.text }}>
                {r.name[0]?.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText type="caption" tone="secondary" style={{ fontSize: 10 }} numberOfLines={1} className="mt-1 text-center">
              {r.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
