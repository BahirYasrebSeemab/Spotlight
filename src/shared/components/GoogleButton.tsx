import { TouchableOpacity, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface GoogleButtonProps {
  onPress: () => void;
  className?: String;
}

export const GoogleButton = ({ onPress, className }: GoogleButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`${className} w-full border border-gray-300 dark:border-gray-700 flex-row items-center justify-center py-3 rounded-xl`}
  >
    <Ionicons name="logo-google" size={18} color="#DB4437" />
    <Text className="text-black dark:text-white font-medium ml-2">Continue with Google</Text>
  </TouchableOpacity>
);
