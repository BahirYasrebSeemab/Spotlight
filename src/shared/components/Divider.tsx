import { View, Text } from 'react-native';

interface DividerProps {
  label?: string;
}

export const Divider = ({ label = 'or' }: DividerProps) => (
  <View className="flex-row items-center my-6">
    <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-700" />
    <Text className="mx-3 text-gray-500 dark:text-gray-400 text-sm">{label}</Text>
    <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-700" />
  </View>
);
