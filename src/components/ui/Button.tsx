import { ActivityIndicator, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Pressable, Text } from '@/components/tw';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  shape?: 'pill' | 'sharp';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  shape = 'pill',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  onPress,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useAppTheme();

  const backgrounds: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: theme.accent,
    secondary: theme.backgroundElevated,
    ghost: 'transparent',
    danger: theme.danger,
    outline: 'transparent',
  };

  const borders: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: theme.accent,
    secondary: theme.border,
    ghost: 'transparent',
    danger: theme.danger,
    outline: theme.borderFocus,
  };

  const textColors: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: theme.name === 'dark' ? '#0B0F19' : '#FFFFFF',
    secondary: theme.text,
    ghost: theme.accent,
    danger: '#FFFFFF',
    outline: theme.accent,
  };

  const sizes: Record<NonNullable<ButtonProps['size']>, { py: number; px: number; fontSize: number }> = {
    sm: { py: 8, px: 14, fontSize: 13 },
    md: { py: 12, px: 20, fontSize: 15 },
    lg: { py: 15, px: 26, fontSize: 16 },
  };

  const s = sizes[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      onPress={(event) => {
        if (isDisabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(event);
      }}
      disabled={isDisabled}
      className={className}
      style={({ pressed }) =>
        [
          {
            backgroundColor: backgrounds[variant],
            borderColor: borders[variant],
            borderWidth: variant === 'ghost' || variant === 'outline' ? 1.5 : 1,
            borderRadius: shape === 'pill' ? 999 : 10,
            paddingVertical: s.py,
            paddingHorizontal: s.px,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            opacity: isDisabled ? 0.5 : pressed ? 0.86 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
          style,
        ] as any
      }
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <Text
          style={{
            color: textColors[variant],
            fontSize: s.fontSize,
            fontFamily: 'Inter_600SemiBold',
            textAlign: 'center',
          }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}