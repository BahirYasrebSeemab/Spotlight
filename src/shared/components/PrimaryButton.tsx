import { ActivityIndicator} from 'react-native';
import { TouchableOpacity, Text } from 'react-native';

export interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  px?: string;
  loading: boolean;
}

export const PrimaryButton = ({
  loading,
  icon,
  px,
  title,
  onPress,
  disabled,
}: PrimaryButtonProps & { icon?: any }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 ${px} rounded-xl ${disabled || loading ? 'bg-gray-400' : 'bg-white'}`}
    >
      <Text className="text-white text-center font-semibold">
        {loading ? <ActivityIndicator size="small" color="#000000" /> : title}
      </Text>
    </TouchableOpacity>
  );
};
