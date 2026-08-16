// ========================================
// app/(auth)/forget-password.tsx - Updated Forgot Password Screen
// ========================================
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Button, Input } from '@/src/shared/ui';
import { AuthHeader } from '@/src/features/auth/components';
import { useForgotPassword } from '@/src/features/auth/hooks';

export default function ForgetPasswordScreen() {
  const { email, handleReset, loading, localError, setEmail, success } = useForgotPassword();
  const router = useRouter();

  return (
    <KeyboardAwareScrollView className="flex-1 bg-black">
      <View className="flex-1 justify-center px-8 py-12">
        <AuthHeader title="Reset Password" subtitle="Enter your email and we'll send you a reset link" />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading && !success}
        />

        {/* Success Message */}
        {success && (
          <View className="bg-white/10 p-4 rounded-xl mb-4">
            <Text className="text-white text-center font-medium">✓ Check your inbox for a reset link</Text>
          </View>
        )}

        {/* Error Message */}
        {localError && <Text className="text-destructive-foreground text-center mb-2">{localError}</Text>}

        {/* Send Reset Link Button */}
        <Button
          title={success ? 'Email Sent' : 'Send Reset Link'}
          loading={loading}
          disabled={loading || success}
          onPress={handleReset}
          className="mt-4"
        />

        {/* Back to Login */}
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-center text-white">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
