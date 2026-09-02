import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { useUserStore } from '@/stores/useUserStore';

export default function IndexGate() {
  const { theme } = useAppTheme();
  const hydrated = useUserStore((state) => state.hydrated);
  const onboardingComplete = useUserStore((state) => state.profile?.onboardingComplete);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return <Redirect href={onboardingComplete ? '/(tabs)' : '/(stack)/onboarding'} />;
}