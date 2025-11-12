import { Text, TouchableOpacity } from 'react-native';
import { InputField } from '@/src/shared/components/InputField';
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

      <InputField password={true} label="Password" value={password} onChangeText={setPassword} />
      <InputField password={true} label="Confirm Password" value={confirm} onChangeText={setConfirm} />

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
