import { Text, TouchableOpacity, View } from 'react-native';
import { InputField } from '@/src/shared/components/InputField';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function ResetPasswordScreen() {
  const { password, confirm, setPassword, setConfirm, handleSubmit, localError, success } = useResetPassword();
  const { loading } = useAppSelector(state => state.auth);

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
    >
      <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Reset Password</Text>

      {!success ? (
        <>
          <InputField password={true} label="New Password" value={password} onChangeText={setPassword} />
          <InputField password={true} label="Confirm Password" value={confirm} onChangeText={setConfirm} />

          {localError && <Text className="text-center mb-4 text-red-500">{localError}</Text>}

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
        <View className="items-center">
          <Text className="text-2xl font-bold text-green-500 mb-2">✓ Password Updated!</Text>
          <Text className="text-center text-gray-600 dark:text-gray-300">Redirecting to login...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
