// ========================================
// src/features/auth/components/SignupStep1.tsx - Updated
// ========================================
import { View } from 'react-native';

import { Divider } from '@/src/shared/components/Divider';
import { GoogleButton } from '@/src/shared/components/GoogleButton';

import { SignupForm } from '../../../shared/types/form.types';
import { InputField } from '../../../shared/components/InputField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';

interface SignupStep1Props {
  form: SignupForm;
  loading: boolean;
  onNext: () => void;
  handleGoogleLogin: () => void;
  onChange: (field: keyof SignupForm, value: string) => void;
}

export const SignupStep1 = ({ form, handleGoogleLogin, loading, onChange, onNext }: SignupStep1Props) => {
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
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={v => onChange('email', v)}
        editable={!loading}
      />

      <PrimaryButton title="Next" onPress={onNext} disabled={!isValid || loading} loading={loading} />

      <Divider />

      <GoogleButton loading={loading} handleGoogleLogin={handleGoogleLogin} disabled={loading} />
    </View>
  );
};
