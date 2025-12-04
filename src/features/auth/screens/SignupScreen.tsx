import { View } from 'react-native';
import { SignupStep1, SignupStep2, AuthHeader } from '@/src/features/auth/components';
import { useSignup, useOAuth } from '@/src/features/auth/hooks';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SignupScreen() {
  const { form, step, nextStep, prevStep, updateField, handleSignup, loading, error } = useSignup();
  const {loading: oAuthLoading, handleGoogleLogin} = useOAuth();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center px-8 py-12">
        <AuthHeader title="Create Account" />

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
            onNext={handleSignup} // now submits here
            onBack={prevStep}
            error={error}
          />
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}
