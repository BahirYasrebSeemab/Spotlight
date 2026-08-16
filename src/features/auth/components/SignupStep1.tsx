// ========================================
// src/features/auth/components/SignupStep1.tsx - Updated
// ========================================
import { View } from 'react-native';

import { Button, Divider, Input } from '@/src/shared/ui';
import { GoogleButton } from '@/src/shared/components/GoogleButton';

import { SignupForm } from '../../../shared/types/form.types';

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
      <Input
        label="Full Name"
        placeholder="John Doe"
        value={form.fullName}
        onChangeText={v => onChange('fullName', v)}
        editable={!loading}
      />

      <Input
        label="Age"
        placeholder="18"
        keyboardType="number-pad"
        value={form.dob}
        onChangeText={v => onChange('dob', v)}
        editable={!loading}
      />

      <Input
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={v => onChange('email', v)}
        editable={!loading}
      />

      <Button title="Next" onPress={onNext} disabled={!isValid || loading} loading={loading} />

      <Divider />

      <GoogleButton loading={loading} handleGoogleLogin={handleGoogleLogin} disabled={loading} />
    </View>
  );
};
