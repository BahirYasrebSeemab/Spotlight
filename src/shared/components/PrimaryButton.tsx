import { TouchableOpacity, Text } from 'react-native';

export interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  px?: string;
}


export const PrimaryButton = ({ px, title, onPress, disabled }: PrimaryButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`py-3 ${px} rounded-xl ${disabled ? 'bg-gray-400' : 'bg-blue-500'}`}
  >
    <Text className="text-white text-center font-semibold">{title}</Text>
  </TouchableOpacity>
);
