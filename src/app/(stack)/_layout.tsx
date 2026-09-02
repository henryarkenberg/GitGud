import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="settings" />
      <Stack.Screen name="slumber" />
      <Stack.Screen name="vessel" />
      <Stack.Screen name="covenant" />
      <Stack.Screen name="ledger" />
      <Stack.Screen name="oracle-logs" />
      <Stack.Screen name="oracle-chat" />
    </Stack>
  );
}