// app/product/_layout.tsx
import { Stack } from 'expo-router';

import { EmailVerifiedGuard } from '@/src/shared/components/EmailVerifiedGaurd';

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
