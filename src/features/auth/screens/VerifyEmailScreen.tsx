import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { Button } from '@/src/shared/ui';
import { useResendVerification } from '@/src/features/auth/hooks/useResendVerification';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { loading, message, resend } = useResendVerification();

  return (
    <View className="flex-1 justify-center items-center bg-background px-6">
      <Text className="text-2xl font-semibold text-center text-foreground mb-4">Verify Your Email</Text>
      <Text className="text-muted-foreground text-center mb-6">
        A verification link has been sent to {email}. Please check your inbox and click the link to verify your account.
      </Text>

      <Button
        title="Resend Email"
        loading={loading}
        disabled={loading}
        onPress={() => resend(email)}
        fullWidth={false}
      />

      {message && <Text className="text-green-500 mt-4 text-center">{message}</Text>}
    </View>
  );
}
