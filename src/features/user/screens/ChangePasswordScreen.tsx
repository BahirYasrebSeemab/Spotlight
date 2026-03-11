// ========================================
// app/(tabs)/profile/change-password.tsx - FIXED Change Password
// ========================================
import { Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { InputField } from '@/src/shared/components/InputField';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';
import { CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ChangePasswordScreen() {
  const { password, confirm, setPassword, setConfirm, handleSubmit, localError, success, loading } = useResetPassword();
  const router = useRouter();

  if (success) {
    // Show success and redirect
    setTimeout(() => router.back(), 2000);
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
    >
      <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Change Password</Text>

      {!success ? (
        <>
          <InputField
            password={true}
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <InputField
            password={true}
            label="Confirm Password"
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            editable={!loading}
          />

          {localError && (
            <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">
              <Text className="text-red-600 dark:text-red-400 text-center">{localError}</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`w-full py-3 rounded-xl ${loading ? 'bg-gray-400' : 'bg-white dark:bg-white'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-black text-center font-semibold text-base">Update Password</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View className="items-center py-12">
          <View className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 mb-6">
            <CheckCircle size={64} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-black dark:text-white mb-2">Password Updated!</Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center">Returning to settings...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
