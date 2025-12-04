import { View, TouchableOpacity, Text } from 'react-native';
import { InputField } from '../../../shared/components/InputField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { SignupForm } from '../../../shared/types/form.types';

interface SignupStep2Props {
  form: SignupForm;
  onChange: (field: keyof SignupForm, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  error: string | null;
}

export const SignupStep2 = ({ form, onChange, onNext, onBack, error }: SignupStep2Props) => (
  <View>
    <InputField label="Username" value={form.username} onChangeText={v => onChange('username', v)} />
    <InputField password={true} label="Password" value={form.password} onChangeText={v => onChange('password', v)} />
    <InputField
      password={true}
      label="Confirm Password"
      value={form.confirmPass}
      onChangeText={v => onChange('confirmPass', v)}
    />

    {error && <Text className="text-red-500 text-center">{error}</Text>}

    <View className="flex-row justify-between mt-4">
      <TouchableOpacity onPress={onBack}>
        <Text className="text-blue-500">Back</Text>
      </TouchableOpacity>
      <PrimaryButton
        px="px-4"
        title="Next"
        onPress={onNext}
        disabled={!form.username || !form.password || !form.confirmPass}
      />
    </View>
  </View>
);
