import { View, TouchableOpacity, Text } from 'react-native';
import { InputField } from '../../../shared/components/InputField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { PasswordInput } from '../../../shared/components/PasswordInput';
import { SignupForm } from '../../../shared/types/form.types';

interface SignupStep2Props {
  form: SignupForm;
  onChange: (field: keyof SignupForm, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const SignupStep2 = ({ form, onChange, onNext, onBack }: SignupStep2Props) => (
  <View>
    <InputField
      label="Username"
      placeholder="Choose a username"
      value={form.username}
      onChangeText={v => onChange('username', v)}
    />
    <PasswordInput label="Password" value={form.password} onChangeText={v => onChange('password', v)} />
    <PasswordInput label="Confirm Password" value={form.confirmPass} onChangeText={v => onChange('confirmPass', v)} />

    <View className="flex-row justify-between mt-4">
      <TouchableOpacity onPress={onBack}>
        <Text className="text-blue-500">Back</Text>
      </TouchableOpacity>
      <PrimaryButton title="Next" onPress={onNext} />
    </View>
  </View>
);
