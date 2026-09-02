import { Moon } from 'lucide-react-native';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { formatDuration } from '@/utils/sleep';

export interface SleepDebtMeterProps {
  debtMinutes: number;
  targetMinutes: number;
}

export function SleepDebtMeter({ debtMinutes, targetMinutes }: SleepDebtMeterProps) {
  const { theme } = useAppTheme();
  const inDebt = debtMinutes > 0;
  const cap = targetMinutes;
  const ratio = Math.min(1, debtMinutes / cap);

  return (
    <View
      className="rounded-2xl border p-4"
      style={{ borderColor: inDebt ? theme.warning : theme.borderFocus, backgroundColor: theme.backgroundElevated }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Moon size={14} color={inDebt ? theme.warning : theme.accent} />
          <ThemedText type="caption" tone="accent">
            SLEEP DEBT
          </ThemedText>
        </View>
        <ThemedText type="mono" style={{ color: inDebt ? theme.warning : theme.success }}>
          {inDebt ? `-${formatDuration(debtMinutes)}` : 'REPAID'}
        </ThemedText>
      </View>

      <View className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: theme.background }}>
        <View
          style={{
            width: inDebt ? `${ratio * 100}%` : '100%',
            height: '100%',
            backgroundColor: inDebt ? theme.warning : theme.success,
            borderRadius: 999,
          }}
        />
      </View>

      <ThemedText type="caption" tone="secondary" className="mt-2">
        {inDebt
          ? `You owe the night ${formatDuration(debtMinutes)}. Sleep longer to repay.`
          : `Debt cleared. The night is balanced.`}
      </ThemedText>
    </View>
  );
}
