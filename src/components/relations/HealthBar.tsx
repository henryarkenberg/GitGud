import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface HealthBarProps {
  health: number;
  maxHealth: number;
}

export function HealthBar({ health, maxHealth }: HealthBarProps) {
  const { theme } = useAppTheme();
  const ratio = maxHealth > 0 ? Math.max(0, health) / maxHealth : 0;
  const estranged = health <= 0;
  const color = estranged ? theme.danger : ratio < 0.4 ? theme.danger : ratio < 0.7 ? theme.warning : theme.success;

  return (
    <View className="flex-1">
      <View className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.background }}>
        <View style={{ width: `${Math.min(100, ratio * 100)}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
      </View>
      {estranged ? (
        <ThemedText type="caption" tone="danger" className="mt-1" style={{ fontSize: 10 }}>
          ESTRANGED · reconcile to restore
        </ThemedText>
      ) : (
        <ThemedText type="caption" tone="secondary" className="mt-1" style={{ fontSize: 10 }}>
          {health}/{maxHealth} · {ratio < 0.4 ? 'fading' : ratio < 0.7 ? 'weakening' : 'strong'}
        </ThemedText>
      )}
    </View>
  );
}
