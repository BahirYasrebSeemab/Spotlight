// ========================================
// src/features/auth/components/SignupStep2.tsx - Updated
// ========================================
import { View, Text } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { Button, Input } from '@/src/shared/ui';

import { SignupForm } from '../../../shared/types/form.types';

interface SignupStep2Props {
  form: SignupForm;
  loading: boolean;
  onNext: () => void;
  onBack: () => void;
  error: string | null;
  onChange: (field: keyof SignupForm, value: string) => void;
}

export const SignupStep2 = ({ error, form, loading, onBack, onChange, onNext }: SignupStep2Props) => {
  const isValid =
    form.username.trim() && form.password.trim() && form.confirmPass.trim() && form.password === form.confirmPass;

  const passwordsMatch = !form.confirmPass || form.password === form.confirmPass;

  return (
    <View>
      <Input
        label="Username"
        placeholder="johndoe"
        autoCapitalize="none"
        value={form.username}
        onChangeText={v => onChange('username', v)}
        editable={!loading}
      />

      <Input
        password={true}
        label="Password"
        placeholder="••••••••"
        value={form.password}
        onChangeText={v => onChange('password', v)}
        editable={!loading}
      />

      <Input
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
        <View className="bg-destructive/20 p-3 rounded-xl mb-4">
          <Text className="text-destructive-foreground text-center">{error}</Text>
        </View>
      )}

      {/* Buttons */}
      <View className="flex-row justify-between items-center mt-4 gap-3">
        <Button
          variant="outline"
          title="Back"
          onPress={onBack}
          disabled={loading}
          fullWidth={false}
          icon={<ChevronLeft size={20} color="#6B7280" />}
        />

        <View className="flex-1">
          <Button loading={loading} title="Create Account" onPress={onNext} disabled={!isValid || loading} />
        </View>
      </View>
    </View>
  );
};
