import type { LucideIcon } from 'lucide-react-native';

import { View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface PlaceholderScreenProps {
  icon: LucideIcon;
  title: string;
  lore: string;
  version: string;
}

export function PlaceholderScreen({ icon: Icon, title, lore, version }: PlaceholderScreenProps) {
  const { theme } = useAppTheme();
  return (
    <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: theme.background }}>
      <View
        className="mb-5 h-20 w-20 items-center justify-center rounded-2xl border"
        style={{ borderColor: theme.borderFocus, backgroundColor: theme.backgroundElevated }}
      >
        <Icon size={36} color={theme.accent} />
      </View>
      <ThemedText type="title" className="text-center">
        {title}
      </ThemedText>
      <ThemedText type="subtitle" tone="secondary" className="mt-2 text-center">
        {lore}
      </ThemedText>
      <View
        className="mt-6 rounded-full px-3.5 py-1.5"
        style={{ backgroundColor: theme.backgroundElevated, borderColor: theme.border, borderWidth: 1 }}
      >
        <ThemedText type="caption" tone="accent">
          {version}
        </ThemedText>
      </View>
    </View>
  );
}