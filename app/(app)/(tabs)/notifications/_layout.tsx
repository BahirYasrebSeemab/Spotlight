// app/(tabs)/search/_layout.tsx (if using nested routes)
import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="index"
        options={{
          headerStyle: { backgroundColor: 'transparent' },
          title: 'Notifications',
        }}
      />
    </Stack>
  );
}
