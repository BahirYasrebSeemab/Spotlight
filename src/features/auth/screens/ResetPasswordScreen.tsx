import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useResetPassword } from '../hooks/useResetPassword';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function ResetPasswordScreen() {
  const { password, confirm, setPassword, setConfirm, handleSubmit, localError, success } = useResetPassword();
  // Only use loading from auth state; do not reference accessToken (not present on AuthState)
  const { loading } = useAppSelector(state => state.auth);

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
    >
      <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Reset Password</Text>

      <TextInput
        className="border px-4 py-2 rounded mb-4 bg-white dark:bg-gray-800 text-black dark:text-white"
        placeholder="New Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        className="border px-4 py-2 rounded mb-4 bg-white dark:bg-gray-800 text-black dark:text-white"
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />

      {(localError || success) && (
        <Text className={`text-center mb-4 ${localError ? 'text-red-500' : 'text-green-500'}`}>
          {localError || 'Password updated!'}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`w-full py-3 rounded-xl ${loading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
      >
        <Text className="text-white text-center font-semibold text-base">
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}
