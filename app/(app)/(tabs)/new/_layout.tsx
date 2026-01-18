// app/(tabs)/new/_layout.tsx (if using nested routes)
import { Stack } from 'expo-router';

export default function NewLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
