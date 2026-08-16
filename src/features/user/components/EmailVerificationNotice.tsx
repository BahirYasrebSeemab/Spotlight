import { View, Text } from 'react-native';

import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { useResendVerification } from '@/src/features/auth/hooks/useResendVerification';

interface Props {
  email: string;
}

export default function EmailVerificationNotice({ email }: Props) {
  const { loading, message, resend } = useResendVerification();

  return (
    <View className="flex-1 justify-center items-center bg-background p-4">
      <Text className="text-center text-lg text-foreground mb-4">
        Your email is not verified. Please check your inbox.
      </Text>

      {message && <Text className="text-center mb-4 text-sm text-muted-foreground">{message}</Text>}

      <PrimaryButton
        title={loading ? 'Resending...' : 'Resend Verification Email'}
        onPress={() => resend(email)}
        disabled={loading}
        loading={loading}
        px="px-6"
      />
    </View>
  );
}
