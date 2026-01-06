// ========================================
// src/shared/components/GoogleButton.tsx - Updated
// ========================================
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface GoogleButtonProps {
  loading: boolean;
  handleGoogleLogin: () => void;
  className?: string;
  disabled?: boolean;
}

export const GoogleButton = ({ loading, handleGoogleLogin, className, disabled }: GoogleButtonProps) => (
  <TouchableOpacity
    onPress={handleGoogleLogin}
    disabled={loading || disabled}
    className={`w-full py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 flex-row items-center justify-center ${className || ''}`}
  >
    {loading ? (
      <ActivityIndicator color="#4285F4" />
    ) : (
      <View className="flex-row items-center gap-3">
        <Text className="text-2xl">🔍</Text>
        <Text className="text-black dark:text-white font-semibold">Continue with Google</Text>
      </View>
    )}
  </TouchableOpacity>
);
