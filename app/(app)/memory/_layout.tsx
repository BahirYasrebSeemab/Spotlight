import { Stack } from 'expo-router';
import { EmailVerifiedGuard } from '@/src/shared/components/EmailVerifiedGaurd';

export default function MemoryRootLayout() {
  return (
    <EmailVerifiedGuard>
      <Stack screenOptions={{ headerShown: false }} />
    </EmailVerifiedGuard>
  );
}
