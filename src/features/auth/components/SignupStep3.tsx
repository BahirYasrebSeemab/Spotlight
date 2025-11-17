import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { InputField } from '../../../shared/components/InputField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { AvatarPicker } from '../../../shared/components/AvatarPicker';
import { SignupForm } from '../../../shared/types/form.types';

interface SignupStep3Props {
  form: SignupForm;
  onChange: (field: keyof SignupForm, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export const SignupStep3 = ({ form, onChange, onBack, onSubmit, loading, error }: SignupStep3Props) => (
  <View className="space-y-4">
    {/* Avatar Picker */}
    <AvatarPicker avatar={form.avatar} onPick={uri => onChange('avatar', uri)} />

    {/* DOB Input */}
    <InputField
      label="Date of Birth (optional)"
      placeholder="Date of birth (YYYY-MM-DD)"
      keyboardType="default"
      value={form.dob || ''}
      onChangeText={v => onChange('dob', v)}
    />

    {/* Error message */}
    {error && <Text className="text-red-500 text-center">{error}</Text>}

    {/* Buttons */}
    <View className="flex-row justify-between mt-4 items-center">
      <TouchableOpacity onPress={onBack}>
        <Text className="text-blue-500 font-semibold">Back</Text>
      </TouchableOpacity>

      <PrimaryButton title={loading ? 'Signing up...' : 'Finish'} onPress={onSubmit} disabled={loading} />
    </View>
  </View>
);
