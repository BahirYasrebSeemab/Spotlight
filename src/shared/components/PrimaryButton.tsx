import { View } from 'react-native';
import { TouchableOpacity, Text } from 'react-native';

export interface PrimaryButtonProps {
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  px?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PrimaryButton = ({
  icon,
  px,
  title,
  onPress,
  disabled,
  children,
  className,
}: PrimaryButtonProps & { icon?: any }) => {
  if (children) return <View>{children}</View>;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`py-3 ${px} rounded-xl ${disabled ? 'bg-gray-400' : 'bg-blue-500'} ${className}`}
    >
      <Text className="text-white text-center font-semibold">
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );
};
