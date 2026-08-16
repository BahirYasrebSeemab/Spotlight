// app/(tabs)/closet/_layout.tsx
import { Stack } from 'expo-router';

export default function ClosetLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="explore" />
    </Stack>
  );
}
