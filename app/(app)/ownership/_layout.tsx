// app/product/_layout.tsx
import { EmailVerifiedGuard } from '@/src/shared/components/EmailVerifiedGaurd';
import { Stack } from 'expo-router';

export default function ProductRootLayout() {
  return (
    <EmailVerifiedGuard>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
      </Stack>
    </EmailVerifiedGuard>
  );
}
