// ========================================
// app/(auth)/reset-password.tsx - Updated Reset Password Screen
// ========================================
import { Text, TouchableOpacity, View } from 'react-native';
import { InputField } from '@/src/shared/components/InputField';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';
import { AuthHeader } from '@/src/features/auth/components';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { CheckCircle } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const { password, confirm, setPassword, setConfirm, handleSubmit, localError, success, loading } = useResetPassword();

  return (
    <Spotlight intensity={0.25}>
      <KeyboardAwareScrollView
        className="flex-1 bg-black"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      >
      <AuthHeader title="Reset Password" subtitle={!success ? 'Enter your new password below' : undefined} />

      {!success ? (
        <>
          <InputField
            password={true}
            label="New Password"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <InputField
            password={true}
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            editable={!loading}
          />

          {/* Error Message */}
          {localError && <Text className="text-center mb-4 text-white">{localError}</Text>}

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl ${loading ? 'bg-gray-600' : 'bg-white'}`}
          >
            <Text className={`text-center font-semibold text-base ${loading ? 'text-gray-300' : 'text-black'}`}>
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View className="items-center py-12">
          <View className="bg-white/20 rounded-full p-6 mb-6">
            <CheckCircle size={64} color="#ffffff" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">Password Updated!</Text>
          <Text className="text-gray-400 text-center">Redirecting you to login...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
    </Spotlight>
  );
}
