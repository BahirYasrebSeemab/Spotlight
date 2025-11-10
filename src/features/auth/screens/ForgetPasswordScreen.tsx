import { View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { useForgotPassword } from '@/src/features/auth/hooks';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function ForgetPasswordScreen() {
  const { email, setEmail, handleReset, localError, success } = useForgotPassword();
  const { loading, error } = useAppSelector(s => s.auth);

  return (
    <KeyboardAwareScrollView className="flex-1 bg-white dark:bg-black">
      <View className="flex-1 justify-center px-8 py-12">
        <Text className="text-3xl text-center font-bold text-black dark:text-white mb-10">Reset Password</Text>

        <InputField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {(localError || error) && <Text className="text-red-500 text-center mb-2">{localError || error}</Text>}

        {success && <Text className="text-green-500 text-center mb-2">Check your inbox for a reset link.</Text>}

        <TouchableOpacity
          disabled={loading}
          onPress={handleReset}
          className={`w-full py-3 rounded-xl mt-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          <Text className="text-white text-center text-base font-semibold">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
