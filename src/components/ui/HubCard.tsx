import { ChevronRight, type LucideIcon } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface HubCardProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  value?: string;
  accent?: boolean;
  onPress: () => void;
}

export function HubCard({ icon: Icon, title, subtitle, value, accent = false, onPress }: HubCardProps) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.backgroundElevated,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        opacity: pressed ? 0.86 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      })}
    >
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          backgroundColor: accent ? theme.accentSoft : theme.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={22} color={accent ? theme.accent : theme.text} />
      </View>
      <View className="flex-1 pr-2">
        <ThemedText type="body" bold>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" tone="secondary" className="mt-0.5">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {value ? (
        <ThemedText type="mono" tone={accent ? 'accent' : 'secondary'}>
          {value}
        </ThemedText>
      ) : null}
      <ChevronRight size={16} color={theme.textSecondary} />
    </Pressable>
  );
}
