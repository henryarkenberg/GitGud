import { useColorScheme } from 'react-native';

import { DarkColors, LightColors, type ThemeColors } from '@/constants/theme';
import { useThemeStore } from '@/stores/useThemeStore';

export function useAppTheme(): { theme: ThemeColors; scheme: 'dark' | 'light' } {
  const preference = useThemeStore((state) => state.preference);
  const systemScheme = useColorScheme();
  const scheme: 'dark' | 'light' =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;
  return { theme: scheme === 'dark' ? DarkColors : LightColors, scheme };
}