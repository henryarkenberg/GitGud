import { Tabs } from 'expo-router';
import { Dumbbell, Hammer, House, Share2, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONTS } from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function TabsLayout() {
  const { theme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(10, insets.bottom + 4);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 62 + bottomPad,
          paddingTop: 7,
          paddingBottom: bottomPad,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.bodySemiBold,
          fontSize: 10,
          letterSpacing: 0.4,
          textTransform: 'uppercase',
        },
        tabBarIconStyle: { marginTop: 0 },
      }}
    >
      <Tabs.Screen
        name="work"
        options={{
          title: 'Work',
          tabBarIcon: ({ color }) => <Hammer size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fitness"
        options={{
          title: 'Fitness',
          tabBarIcon: ({ color }) => <Dumbbell size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="network"
        options={{
          title: 'Network',
          tabBarIcon: ({ color }) => <Share2 size={21} color={color} />,
        }}
      />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color }) => <Sparkles size={21} color={color} />,
        }}
      />

      {/* Sub-screens reachable from hub panels — hidden from the tab bar */}
      <Tabs.Screen name="sanctum" options={{ href: null }} />
      <Tabs.Screen name="forge" options={{ href: null }} />
      <Tabs.Screen name="rituals" options={{ href: null }} />
      <Tabs.Screen name="aetherium" options={{ href: null }} />
    </Tabs>
  );
}
