// ========================================
// app/(tabs)/profile/change-password.tsx - FIXED Change Password
// ========================================
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Button, Input } from '@/src/shared/ui';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';

export default function ChangePasswordScreen() {
  const { confirm, handleSubmit, loading, localError, password, setConfirm, setPassword, success } = useResetPassword();
  const router = useRouter();

  if (success) {
    // Show success and redirect
    setTimeout(() => router.back(), 2000);
  }

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
    >
      <Text className="text-3xl font-extrabold text-center text-foreground mb-10">Change Password</Text>

      {!success ? (
        <>
          <Input
            password={true}
            label="New Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <Input
            password={true}
            label="Confirm Password"
            placeholder="••••••••"
            value={confirm}
            onChangeText={setConfirm}
            editable={!loading}
          />

          {localError && (
            <View className="bg-destructive/20 p-3 rounded-xl mb-4">
              <Text className="text-destructive-foreground text-center">{localError}</Text>
            </View>
          )}

          <Button title="Update Password" loading={loading} disabled={loading} onPress={handleSubmit} />
        </>
      ) : (
        <View className="items-center py-12">
          <View className="bg-green-900/30 rounded-full p-6 mb-6">
            <CheckCircle size={64} color="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-foreground mb-2">Password Updated!</Text>
          <Text className="text-muted-foreground text-center">Returning to settings...</Text>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
}
