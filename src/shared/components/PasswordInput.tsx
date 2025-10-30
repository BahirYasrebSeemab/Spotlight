import { useState } from 'react';
import { TextInput, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}

export const PasswordInput = ({ label, value, onChangeText }: PasswordInputProps) => {
  const [show, setShow] = useState(false);
  return (
    <View className="mb-4 relative">
      <Text className="text-sm text-gray-600 dark:text-gray-300 mb-1">{label}</Text>
      <TextInput
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
        className="border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-black dark:text-white"
      />
      <TouchableOpacity onPress={() => setShow(!show)} className="absolute right-3 top-[55%]">
        <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
      </TouchableOpacity>
    </View>
  );
};
