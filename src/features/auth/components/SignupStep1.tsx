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

export const SignupStep1 = ({ form, onChange, onNext, handleGoogleLogin, loading }: SignupStep1Props) => (
  <View>
    <InputField
      label="Full Name"
      placeholder="Your full name"
      value={form.fullName}
      onChangeText={v => onChange('fullName', v)}
    />
    <InputField
      label="Email"
      placeholder="Your email"
      keyboardType="email-address"
      autoCapitalize="none"
      value={form.email}
      onChangeText={v => onChange('email', v)}
    />
    <PrimaryButton title="Next" onPress={onNext} disabled={!form.fullName || !form.email} />
    <Divider />
    <GoogleButton loading={loading} handleGoogleLogin={handleGoogleLogin} />
  </View>
);
