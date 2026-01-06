// ========================================
// src/features/auth/components/SignupStep1.tsx - Updated
// ========================================
import { View } from 'react-native';
import { InputField } from '../../../shared/components/InputField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { SignupForm } from '../../../shared/types/form.types';
import { Divider } from '@/src/shared/components/Divider';
import { GoogleButton } from '@/src/shared/components/GoogleButton';

interface SignupStep1Props {
  form: SignupForm;
  onChange: (field: keyof SignupForm, value: string) => void;
  onNext: () => void;
  handleGoogleLogin: () => void;
  loading: boolean;
}

export const SignupStep1 = ({ form, onChange, onNext, handleGoogleLogin, loading }: SignupStep1Props) => {
  const isValid = form.fullName.trim() && form.dob && form.email.trim();

  return (
    <View>
      <InputField
        label="Full Name"
        placeholder="John Doe"
        value={form.fullName}
        onChangeText={v => onChange('fullName', v)}
        editable={!loading}
      />

      <InputField
        label="Age"
        placeholder="18"
        keyboardType="number-pad"
        value={form.dob}
        onChangeText={v => onChange('dob', v)}
        editable={!loading}
      />

      <InputField
        label="Email"
        placeholder="john@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={v => onChange('email', v)}
        editable={!loading}
      />

      <PrimaryButton title="Next" onPress={onNext} disabled={!isValid || loading} />

      <Divider />

      <GoogleButton loading={loading} handleGoogleLogin={handleGoogleLogin} disabled={loading} />
    </View>
  );
};
