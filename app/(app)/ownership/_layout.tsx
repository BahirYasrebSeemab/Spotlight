// app/product/_layout.tsx
import { Stack } from 'expo-router';

export default function ProductRootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      </Stack>
  );
}
