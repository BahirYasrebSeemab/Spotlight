import { View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useForgotPassword } from '@/src/features/auth/hooks';

export default function ForgetPasswordScreen() {
  const { email, setEmail, handleReset, localError, success } = useForgotPassword();
  const { loading, error } = useAppSelector(state => state.auth);

  return (
    <KeyboardAwareScrollView className="flex-1 bg-white dark:bg-black" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 justify-center px-8 py-12">
        <Text className="text-3xl text-center font-extrabold text-black dark:text-white mb-10">Reset Password</Text>

        <InputField
          label="Email"
          value={email}
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
        />

        {(localError || error) && <Text className="text-red-500 text-center mb-2">{localError || error}</Text>}

        {success && <Text className="text-green-500 text-center mb-2">Check your inbox to continue.</Text>}

        <TouchableOpacity
          onPress={handleReset}
          disabled={loading}
          className={`w-full py-3 rounded-xl mb-4 ${loading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
        >
          <Text className="text-white text-center font-semibold text-base">
            {loading ? 'Sending...' : 'Send reset link'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
