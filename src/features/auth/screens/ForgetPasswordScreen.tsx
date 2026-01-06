// ========================================
// app/(auth)/forget-password.tsx - Updated Forgot Password Screen
// ========================================
import { View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { InputField } from '@/src/shared/components/InputField';
import { useForgotPassword } from '@/src/features/auth/hooks';
import { AuthHeader } from '@/src/features/auth/components';

export default function ForgetPasswordScreen() {
  const { email, setEmail, handleReset, localError, success, loading } = useForgotPassword();
  const router = useRouter();

  return (
    <KeyboardAwareScrollView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 justify-center px-8 py-12">
        <AuthHeader title="Reset Password" subtitle="Enter your email and we'll send you a reset link" />

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading && !success}
        />

        {/* Error Message */}
        {localError && <Text className="text-red-500 text-center mb-2">{localError}</Text>}

        {/* Success Message */}
        {success && (
          <View className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-4">
            <Text className="text-green-600 dark:text-green-400 text-center font-medium">
              ✓ Check your inbox for a reset link
            </Text>
          </View>
        )}

        {/* Send Reset Link Button */}
        <TouchableOpacity
          disabled={loading || success}
          onPress={handleReset}
          className={`w-full py-3 rounded-xl mt-4 ${loading || success ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
        >
          <Text className="text-white text-center text-base font-semibold">
            {loading ? 'Sending...' : success ? 'Email Sent' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-center text-blue-500 dark:text-blue-400">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
