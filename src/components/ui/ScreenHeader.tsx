import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme } = useAppTheme();
  return (
    <View className="mb-5 flex-row items-center gap-3">
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
        accessibilityRole="button"
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: theme.backgroundElevated,
          borderColor: theme.border,
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <ChevronLeft size={20} color={theme.text} />
      </Pressable>
      <View className="flex-1">
        <ThemedText type="title">{title}</ThemedText>
        {subtitle ? (
          <ThemedText type="small" tone="secondary" className="mt-0.5">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}