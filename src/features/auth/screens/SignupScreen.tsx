// ========================================
// app/(auth)/signup.tsx - Updated Signup Screen
// ========================================
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useSignup, useOAuth } from '@/src/features/auth/hooks';
import { SignupStep1, SignupStep2, AuthHeader } from '@/src/features/auth/components';

export default function SignupScreen() {
  const { error, form, handleSignup, loading, nextStep, prevStep, step, updateField } = useSignup();
  const { handleGoogleLogin } = useOAuth();

  return (
    <KeyboardAwareScrollView
      className="flex-1"
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
            loading={loading}
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
  );
}
