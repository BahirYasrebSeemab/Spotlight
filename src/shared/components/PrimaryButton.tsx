import { ReactNode } from 'react';
import { ActivityIndicator, TouchableOpacity, View, Text } from 'react-native';

export interface PrimaryButtonProps {
  px?: string;
  title?: string;
  loading: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  onPress: () => void;
}

export const PrimaryButton = ({ disabled, icon, loading, onPress, px, title }: PrimaryButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 ${px} rounded-xl ${disabled || loading ? 'bg-gray-400' : 'bg-white'}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#000000" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text className="text-black text-center font-semibold">{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
