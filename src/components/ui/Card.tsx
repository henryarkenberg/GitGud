import type { ViewProps } from 'react-native';

import { View } from '@/components/tw';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  className?: string;
}

export function Card({ elevated = false, style, className, ...props }: CardProps) {
  const { theme } = useAppTheme();
  return (
    <View
      {...props}
      className={className}
      style={[
        {
          backgroundColor: elevated ? theme.backgroundElevated : theme.backgroundSecondary,
          borderColor: theme.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
        },
        style,
      ]}
    />
  );
}