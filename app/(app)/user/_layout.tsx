// app/user/_layout.tsx - User section layout (optional parent)
import { Stack } from 'expo-router';

import { EmailVerifiedGuard } from '@/src/shared/components/EmailVerifiedGaurd';

export default function UserLayout() {
  return (
    <EmailVerifiedGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="[id]" />
      </Stack>
    </EmailVerifiedGuard>
  );
}
