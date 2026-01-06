// ========================================
// app/(auth)/login.tsx - Updated Login Screen
// ========================================
import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { Divider } from '@/src/shared/components/Divider';
import { GoogleButton } from '@/src/shared/components/GoogleButton';
import { useLogin, useOAuth } from '@/src/features/auth/hooks';

export default function LoginScreen() {
  const { email, password, setEmail, setPassword, handleLogin, localError, loading } = useLogin();
  const { handleGoogleLogin, loading: oAuthLoading, localError: oAuthError } = useOAuth();
  const router = useRouter();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center items-center px-8 py-12">
        <View className="w-full max-w-md">
          <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Spotlight</Text>

          {/* Email Input */}
          <InputField
            label="Email"
            placeholderTextColor="#888"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading && !oAuthLoading}
          />

          {/* Password Input */}
          <InputField
            password
            label="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            editable={!loading && !oAuthLoading}
          />

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => router.push('/forget-password')} className="self-end mb-4">
            <Text className="text-sm text-blue-500 dark:text-blue-400">Forgot password?</Text>
          </TouchableOpacity>

          {/* Error Messages */}
          {localError && <Text className="text-red-500 text-center mb-2">{localError}</Text>}
          {oAuthError && <Text className="text-red-500 text-center mb-2">{oAuthError}</Text>}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || oAuthLoading}
            className={`w-full py-3 rounded-xl mb-4 ${loading || oAuthLoading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>

          <Divider />

          {/* Google Login */}
          <GoogleButton
            loading={oAuthLoading}
            disabled={loading}
            className="mb-4"
            handleGoogleLogin={handleGoogleLogin}
          />

          {/* Signup Link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-600 dark:text-gray-300">Don't have an account? </Text>
            <Link href={'/signup'} className="text-blue-500 dark:text-blue-400 font-semibold">
              Sign up
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
