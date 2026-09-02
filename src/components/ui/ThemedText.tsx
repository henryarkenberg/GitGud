import type { TextStyle, TextProps as RNTextProps } from 'react-native';

import { Text } from '@/components/tw';
import { FONTS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export interface ThemedTextProps extends RNTextProps {
  type?: 'display' | 'title' | 'subtitle' | 'body' | 'small' | 'caption' | 'code' | 'mono';
  tone?: 'primary' | 'secondary' | 'accent' | 'danger' | 'success' | 'warning' | 'info';
  bold?: boolean;
  className?: string;
}

export function ThemedText({
  type = 'body',
  tone = 'primary',
  bold = false,
  style,
  className,
  ...props
}: ThemedTextProps) {
  const { theme } = useAppTheme();

  const typography: Record<NonNullable<ThemedTextProps['type']>, TextStyle> = {
    display: { fontFamily: FONTS.display, fontSize: 28, lineHeight: 34, letterSpacing: 0.5 },
    title: { fontFamily: FONTS.display, fontSize: 20, lineHeight: 26 },
    subtitle: { fontFamily: FONTS.displayRegular, fontSize: 16, lineHeight: 22, letterSpacing: 0.3 },
    body: { fontFamily: FONTS.body, fontSize: 15, lineHeight: 21 },
    small: { fontFamily: FONTS.body, fontSize: 13, lineHeight: 18 },
    caption: {
      fontFamily: FONTS.bodySemiBold,
      fontSize: 11,
      lineHeight: 15,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
    },
    code: { fontFamily: FONTS.mono, fontSize: 12, lineHeight: 17 },
    mono: { fontFamily: FONTS.mono, fontSize: 14, lineHeight: 19 },
  };

  const colors: Record<NonNullable<ThemedTextProps['tone']>, string> = {
    primary: theme.text,
    secondary: theme.textSecondary,
    accent: theme.accent,
    danger: theme.danger,
    success: theme.success,
    warning: theme.warning,
    info: theme.info,
  };

  return (
    <Text
      {...props}
      className={className}
      style={[
        typography[type],
        { color: colors[tone] },
        bold ? { fontFamily: FONTS.bodyBold } : null,
        style,
      ]}
    />
  );
}