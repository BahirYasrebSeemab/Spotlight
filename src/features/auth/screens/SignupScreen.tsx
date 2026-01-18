// ========================================
// app/(auth)/signup.tsx - Updated Signup Screen
// ========================================
import { View } from 'react-native';
import { SignupStep1, SignupStep2, AuthHeader } from '@/src/features/auth/components';
import { useSignup, useOAuth } from '@/src/features/auth/hooks';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Spotlight } from '@/src/shared/components/Spotlight';

export default function SignupScreen() {
  const { form, step, nextStep, prevStep, updateField, handleSignup, loading, error } = useSignup();
  const { loading: oAuthLoading, handleGoogleLogin } = useOAuth();

  return (
    <Spotlight intensity={0.25}>
      <KeyboardAwareScrollView
        className="flex-1 bg-black"
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 justify-center px-8 py-12">
        <AuthHeader title="Create Account" subtitle={step === 1 ? "Let's get started" : 'Almost there!'} />

        {step === 1 && (
          <SignupStep1
            form={form}
            onChange={updateField}
            onNext={nextStep}
            handleGoogleLogin={handleGoogleLogin}
            loading={oAuthLoading}
          />
        )}

        {step === 2 && (
          <SignupStep2
            form={form}
            onChange={updateField}
            onNext={handleSignup}
            onBack={prevStep}
            error={error}
            loading={loading}
          />
        )}
      </View>
    </KeyboardAwareScrollView>
    </Spotlight>
  );
}
