// app/ownership/[id]/_layout.tsx
import { Stack } from 'expo-router';

export default function OwnershipLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}