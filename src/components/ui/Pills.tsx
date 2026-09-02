import type { LucideIcon } from 'lucide-react-native';

import { Pressable, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface OptionPillProps {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionPill({ label, hint, selected, onPress }: OptionPillProps) {
  const { theme } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border px-4 py-3"
      style={{
        borderColor: selected ? theme.accent : theme.border,
        backgroundColor: selected ? theme.accentSoft : theme.background,
      }}
    >
      <ThemedText type="body" tone={selected ? 'accent' : 'primary'} bold={selected}>
        {label}
      </ThemedText>
      {hint ? (
        <ThemedText type="small" tone="secondary" className="mt-0.5">
          {hint}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export interface ModuleCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  version: string;
  onPress?: () => void;
}

export function ModuleCard({ icon: Icon, iconColor, title, subtitle, version, onPress }: ModuleCardProps) {
  const { theme } = useAppTheme();
  const color = iconColor ?? theme.accent;
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 flex-row items-center gap-3 rounded-xl border p-3.5"
      style={{ borderColor: theme.border, backgroundColor: theme.backgroundElevated }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          backgroundColor: theme.backgroundSecondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={color} />
      </View>
      <View className="flex-1">
        <ThemedText type="body" bold>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="small" tone="secondary" className="mt-0.5">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      <View
        className="rounded-full px-2 py-0.5"
        style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }}
      >
        <ThemedText type="caption" tone="secondary">
          {version}
        </ThemedText>
      </View>
    </Pressable>
  );
}