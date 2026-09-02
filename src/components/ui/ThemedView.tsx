import type { ViewProps } from 'react-native';

import { View } from '@/components/tw';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'secondary' | 'elevated' | 'transparent';
  className?: string;
}

export function ThemedView({ variant = 'background', style, className, ...props }: ThemedViewProps) {
  const { theme } = useAppTheme();
  const background =
    variant === 'background'
      ? theme.background
      : variant === 'secondary'
        ? theme.backgroundSecondary
        : variant === 'elevated'
          ? theme.backgroundElevated
          : 'transparent';

  return (
    <View
      {...props}
      className={className}
      style={[{ backgroundColor: background }, style]}
    />
  );
}