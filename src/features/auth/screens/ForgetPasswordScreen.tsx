// ========================================
// app/(auth)/forget-password.tsx - Updated Forgot Password Screen
// ========================================
import { View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { InputField } from '@/src/shared/components/InputField';
import { useForgotPassword } from '@/src/features/auth/hooks';
import { AuthHeader } from '@/src/features/auth/components';
import { Spotlight } from '@/src/shared/components/Spotlight';

export default function ForgetPasswordScreen() {
  const { email, setEmail, handleReset, localError, success, loading } = useForgotPassword();
  const router = useRouter();

  return (
    <Spotlight intensity={0.25}>
      <KeyboardAwareScrollView className="flex-1 bg-black">
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
          <View className="bg-white/10 p-4 rounded-xl mb-4">
            <Text className="text-white text-center font-medium">
              ✓ Check your inbox for a reset link
            </Text>
          </View>
        )}

        {/* Error Message */}
        {localError && <Text className="text-white text-center mb-2">{localError}</Text>}

        {/* Send Reset Link Button */}
        <TouchableOpacity
          disabled={loading || success}
          onPress={handleReset}
          className={`w-full py-3 rounded-xl mt-4 ${loading || success ? 'bg-gray-600' : 'bg-white'}`}
        >
          <Text className={`text-center text-base font-semibold ${loading || success ? 'text-gray-300' : 'text-black'}`}>
            {loading ? 'Sending...' : success ? 'Email Sent' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => router.back()} className="mt-6">
          <Text className="text-center text-white">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
    </Spotlight>
  );
}
