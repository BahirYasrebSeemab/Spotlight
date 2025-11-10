import { View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { useResetPassword } from '@/src/features/auth/hooks';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function ResetPasswordScreen() {
  const { password, confirm, setPassword, setConfirm, handleSubmit, localError } = useResetPassword();
  const { loading, error } = useAppSelector(s => s.auth);

  return (
    <KeyboardAwareScrollView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 justify-center px-8 py-12">
        <Text className="text-3xl text-center font-bold text-black dark:text-white mb-10">Set New Password</Text>

        <InputField label="New password" password value={password} onChangeText={setPassword} />

        <InputField label="Confirm password" password value={confirm} onChangeText={setConfirm} />

        {(localError || error) && <Text className="text-red-500 text-center mb-3">{localError || error}</Text>}

        <TouchableOpacity
          disabled={loading}
          onPress={handleSubmit}
          className={`w-full py-3 rounded-xl mt-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          <Text className="text-white text-center text-base font-semibold">
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
