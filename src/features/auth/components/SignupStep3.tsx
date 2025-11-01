import { View, TouchableOpacity, Text } from 'react-native';
import { InputField } from '../../../shared/components/InputField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { AvatarPicker } from '../../../shared/components/AvatarPicker';
import { SignupForm } from '../../../shared/types/form.types';


interface SignupStep3Props {
  form: SignupForm;
  onChange: (field: keyof SignupForm, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const SignupStep3 = ({ form, onChange, onBack, onSubmit }: SignupStep3Props) => (
  <View>
    <AvatarPicker avatar={form.avatar} onPick={uri => onChange('avatar', uri)} />
    <InputField
      label="Age (optional)"
      placeholder="Enter your age"
      keyboardType="numeric"
      value={form.age || ''}
      onChangeText={v => onChange('age', v)}
    />

    <View className="flex-row justify-between mt-4">
      <TouchableOpacity onPress={onBack}>
        <Text className="text-blue-500">Back</Text>
      </TouchableOpacity>
      <PrimaryButton title="Finish" onPress={onSubmit} />
    </View>
  </View>
);
