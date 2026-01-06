import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoogleButtonProps {
  handleGoogleLogin: () => void;
  className?: String;
  loading: boolean;
  disabled?: boolean;
}

export const GoogleButton = ({ loading, handleGoogleLogin, className, disabled }: GoogleButtonProps) => (
  <TouchableOpacity
    disabled={disabled || loading}
    onPress={handleGoogleLogin}
    className={`${className} w-full border border-gray-300 dark:border-gray-700 flex-row items-center justify-center py-3 rounded-xl`}
  >
    {loading ? (
      <ActivityIndicator size="small" color="#DB4437" />
    ) : (
      <View className="flex-row items-center">
        <Ionicons name="logo-google" size={18} color="#DB4437" />
        <Text className="text-black dark:text-white font-medium ml-2">Continue with Google</Text>
      </View>
    )}
  </TouchableOpacity>
);
