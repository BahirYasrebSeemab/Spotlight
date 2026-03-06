// ========================================
// src/features/auth/components/SignupStep2.tsx - Updated
// ========================================
import { View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { InputField } from '../../../shared/components/InputField';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { SignupForm } from '../../../shared/types/form.types';
import { ChevronLeft } from 'lucide-react-native';

interface SignupStep2Props {
  form: SignupForm;
  onChange: (field: keyof SignupForm, value: string) => void;
  onNext: () => void;
  onBack: () => void;
  error: string | null;
  loading: boolean;
}

export const SignupStep2 = ({ form, onChange, onNext, onBack, error, loading }: SignupStep2Props) => {
  const isValid =
    form.username.trim() && form.password.trim() && form.confirmPass.trim() && form.password === form.confirmPass;

  const passwordsMatch = !form.confirmPass || form.password === form.confirmPass;

  return (
    <View>
      <InputField
        label="Username"
        placeholder="johndoe"
        autoCapitalize="none"
        value={form.username}
        onChangeText={v => onChange('username', v)}
        editable={!loading}
      />

      <InputField
        password={true}
        label="Password"
        placeholder="••••••••"
        value={form.password}
        onChangeText={v => onChange('password', v)}
        editable={!loading}
      />

      <InputField
        password={true}
        label="Confirm Password"
        placeholder="••••••••"
        value={form.confirmPass}
        onChangeText={v => onChange('confirmPass', v)}
        editable={!loading}
      />

      {/* Password Match Indicator */}
      {form.confirmPass.length > 0 && !passwordsMatch && (
        <Text className="text-red-500 text-sm mb-2">Passwords don't match</Text>
      )}

      {/* Error Message */}
      {error && (
        <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">
          <Text className="text-red-600 dark:text-red-400 text-center">{error}</Text>
        </View>
      )}

      {/* Buttons */}
      <View className="flex-row justify-between items-center mt-4 gap-3">
        <TouchableOpacity
          onPress={onBack}
          disabled={loading}
          className="flex-row items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl"
        >
          <ChevronLeft size={20} color="#6B7280" />
          <Text className="text-gray-700 dark:text-gray-300 font-medium">Back</Text>
        </TouchableOpacity>

        <View className="flex-1">
          <PrimaryButton
            loading={loading}
            px="px-0"
            title="Create Account"
            onPress={onNext}
            disabled={!isValid || loading}
          />
        </View>
      </View>
    </View>
  );
};
