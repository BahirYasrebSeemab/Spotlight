// ========================================
// app/(auth)/reset-password.tsx - Updated Reset Password Screen
// ========================================
import { Text, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Button, Input } from '@/src/shared/ui';
import { AuthHeader } from '@/src/features/auth/components';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';

export default function ResetPasswordScreen() {
  const { confirm, handleSubmit, loading, localError, password, setConfirm, setPassword, success } = useResetPassword();

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-black"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
    >
      <AuthHeader title="Reset Password" subtitle={!success ? 'Enter your new password below' : undefined} />

      {!success ? (
        <>
          <Input password={true} label="New Password" value={password} onChangeText={setPassword} editable={!loading} />
          <Input
            password={true}
            label="Confirm Password"
            value={confirm}
            onChangeText={setConfirm}
            editable={!loading}
          />

          {/* Error Message */}
          {localError && <Text className="text-center mb-4 text-destructive-foreground">{localError}</Text>}

          {/* Update Button */}
          <Button title="Update Password" loading={loading} disabled={loading} onPress={handleSubmit} />
        </>
      ) : (
        <View className="items-center py-12">
          <View className="bg-white/20 rounded-full p-6 mb-6">
            <CheckCircle size={64} color="#ffffff" />
          </View>
          <Text className="text-2xl font-bold text-white mb-2">Password Updated!</Text>
          <Text className="text-gray-400 text-center">Redirecting you to login...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
