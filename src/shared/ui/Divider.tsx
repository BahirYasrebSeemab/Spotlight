import { View, Text } from 'react-native';

interface DividerProps {
  label?: string;
}

export const Divider = ({ label = 'or' }: DividerProps) => (
  <View className="flex-row items-center my-6">
    <View className="flex-1 h-[1px] bg-border" />
    <Text className="mx-3 text-muted-foreground text-sm">{label}</Text>
    <View className="flex-1 h-[1px] bg-border" />
  </View>
);
