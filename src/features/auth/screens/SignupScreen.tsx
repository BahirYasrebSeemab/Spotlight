import { View } from 'react-native';
import { SignupStep1, SignupStep2, SignupStep3, AuthHeader } from '@/src/features/auth/components';
import { useSignup } from '@/src/features/auth/hooks/useSignup';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function SignupScreen() {
  const { form, step, nextStep, prevStep, updateField, handleSignup } = useSignup();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 justify-center px-8 py-12">
        <AuthHeader title="Create Account" />
        {step === 1 && <SignupStep1 form={form} onChange={updateField} onNext={nextStep} />}
        {step === 2 && <SignupStep2 form={form} onChange={updateField} onNext={nextStep} onBack={prevStep} />}
        {step === 3 && <SignupStep3 form={form} onChange={updateField} onBack={prevStep} onSubmit={handleSignup} />}
      </View>
    </KeyboardAwareScrollView>
  );
}
