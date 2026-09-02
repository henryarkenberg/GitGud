import type { TextInputProps } from 'react-native';

import { TextInput, View } from '@/components/tw';
import { ThemedText } from '@/components/ui/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export function Input({ label, error, value, multiline, style, className, ...props }: InputProps) {
  const { theme } = useAppTheme();
  return (
    <View className={className}>
      {label ? (
        <ThemedText type="caption" tone="secondary" className="mb-1.5">
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        {...props}
        value={value}
        multiline={multiline}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.accent}
        style={[
          {
            backgroundColor: theme.background,
            borderColor: error ? theme.danger : theme.borderFocus,
            borderWidth: 1,
            borderRadius: 10,
            paddingVertical: multiline ? 12 : 11,
            paddingHorizontal: 14,
            color: theme.text,
            fontFamily: 'Inter_400Regular',
            fontSize: 15,
            minHeight: multiline ? 96 : undefined,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          style,
        ]}
      />
      {error ? (
        <ThemedText type="small" tone="danger" className="mt-1">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}