import { TextInputProps } from 'react-native';
import { View, TextInput, Text } from 'react-native';

export interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export const InputField = ({ label, error, ...props }: InputFieldProps) => {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">{label}</Text>
      <TextInput
        className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
        {...props}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
};
