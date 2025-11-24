import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useResendVerification } from '@/src/features/auth/hooks/useResendVerification';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';

interface Props {
  email: string;
}

export default function EmailVerificationNotice({ email }: Props) {
  const { resend, loading, message } = useResendVerification();

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-black p-4">
      <Text className="text-center text-lg mb-4">Your email is not verified. Please check your inbox.</Text>

      {message && <Text className="text-center mb-4 text-sm text-gray-600 dark:text-gray-400">{message}</Text>}

      <PrimaryButton
        title={loading ? 'Resending...' : 'Resend Verification Email'}
        onPress={() => resend(email)}
        disabled={loading}
        px='px-6'
      />
    </View>
  );
}
