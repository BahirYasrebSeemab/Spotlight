import { ActivityIndicator} from 'react-native';
import { TouchableOpacity, Text } from 'react-native';

export interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  px?: string;
}

export const PrimaryButton = ({
  icon,
  px,
  title,
  onPress,
  disabled,
}: PrimaryButtonProps & { icon?: any }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`py-3 ${px} rounded-xl ${disabled ? 'bg-gray-400' : 'bg-blue-500'}`}
    >
      <Text className="text-white text-center font-semibold">
        {disabled ? <ActivityIndicator size="small" color="#000000" /> : title}
      </Text>
    </TouchableOpacity>
  );
};
