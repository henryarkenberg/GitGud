import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  const { theme } = useAppTheme();
  return (
    <View className="mb-3 flex-row items-end justify-between">
      <View className="flex-row items-center gap-2">
        <View className="h-4 w-1 rounded-full" style={{ backgroundColor: theme.accent }} />
        <ThemedText type="caption" tone="accent">
          {title}
        </ThemedText>
      </View>
      {right}
    </View>
  );
}