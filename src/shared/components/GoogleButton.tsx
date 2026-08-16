import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';

interface GoogleButtonProps {
  loading: boolean;
  className?: string;
  disabled?: boolean;
  handleGoogleLogin: () => void;
}

export const GoogleButton = ({ className, disabled, handleGoogleLogin, loading }: GoogleButtonProps) => (
  <TouchableOpacity
    disabled={disabled || loading}
    onPress={handleGoogleLogin}
    className={`${className ?? ''} w-full border border-border flex-row items-center justify-center py-3 rounded-xl`}
  >
    {loading ? (
      <ActivityIndicator size="small" color="#DB4437" />
    ) : (
      <View className="flex-row items-center">
        <Ionicons name="logo-google" size={18} color="#DB4437" />
        <Text className="text-foreground font-medium ml-2">Continue with Google</Text>
      </View>
    )}
  </TouchableOpacity>
);
