// ========================================
// app/(auth)/login.tsx - Updated Login Screen
// ========================================
import { Link, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Divider } from '@/src/shared/components/Divider';
import { useLogin, useOAuth } from '@/src/features/auth/hooks';
import { InputField } from '@/src/shared/components/InputField';
import { GoogleButton } from '@/src/shared/components/GoogleButton';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';

export default function LoginScreen() {
  const { email, handleLogin, loading, localError, password, setEmail, setPassword } = useLogin();
  const { handleGoogleLogin, loading: oAuthLoading, localError: oAuthError } = useOAuth();
  const router = useRouter();

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center items-center px-8 py-12">
        <View className="w-full max-w-md">
          <Text className="text-3xl font-extrabold text-center text-foreground mb-10">Spotlight</Text>

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
            <Text className="text-sm text-foreground">Forgot password?</Text>
          </TouchableOpacity>

          {/* Error Messages */}
          {localError && <Text className="text-destructive-foreground text-center mb-2">{localError}</Text>}
          {oAuthError && <Text className="text-destructive-foreground text-center mb-2">{oAuthError}</Text>}

          {/* Login Button */}
          <View className="mb-4">
            <PrimaryButton title="Log in" loading={loading} disabled={loading || oAuthLoading} onPress={handleLogin} />
          </View>

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
            <Text className="text-muted-foreground">Don't have an account? </Text>
            <Link href={'/signup'} className="text-foreground font-semibold">
              Sign up
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
