// app/(tabs)/search/_layout.tsx (if using nested routes)
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="brand-application" />
    </Stack>
  );
}
