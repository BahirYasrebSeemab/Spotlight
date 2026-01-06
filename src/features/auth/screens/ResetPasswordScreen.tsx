// ========================================
// app/(auth)/reset-password.tsx - Updated Reset Password Screen
// ========================================
import { Text, TouchableOpacity, View } from 'react-native';
import { InputField } from '@/src/shared/components/InputField';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';
import { AuthHeader } from '@/src/features/auth/components';
import { CheckCircle } from 'lucide-react-native';

export default function ResetPasswordScreen() {
  const { password, confirm, setPassword, setConfirm, handleSubmit, localError, success, loading } = useResetPassword();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
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
          {localError && <Text className="text-center mb-4 text-red-500">{localError}</Text>}

          {/* Update Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl ${loading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Updating...' : 'Update Password'}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View className="items-center py-12">
          <View className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 mb-6">
            <CheckCircle size={64} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">Password Updated!</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">Redirecting you to login...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
