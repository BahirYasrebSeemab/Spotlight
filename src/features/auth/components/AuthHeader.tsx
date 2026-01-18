// ========================================
// src/features/auth/components/AuthHeader.tsx - Enhanced
// ========================================
import { Text, View } from 'react-native';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => (
  <View className="mb-10">
    <Text className="text-3xl font-extrabold text-center text-white">{title}</Text>
    {subtitle && <Text className="text-center text-gray-400 mt-2 text-base">{subtitle}</Text>}
  </View>
);
