import { Ionicons } from '@expo/vector-icons';
import { TextInputProps } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, Animated, Easing } from 'react-native';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  value?: string;
  password?: boolean;
}

export const InputField = ({ error, label, password, value, ...props }: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      duration: 200,
      easing: Easing.ease,
      toValue: isFocused || !!value ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedLabel]);

  const labelStyle = {
    backgroundColor: '#000', // Always black background
    color: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: ['#666', '#999'],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    left: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 7],
    }),
    paddingHorizontal: 4,
    position: 'absolute' as const,
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [9, -8],
    }),
  };

  return (
    <View className="mb-5 relative">
      {label && (
        <Animated.Text className="z-10" style={labelStyle}>
          {label}
        </Animated.Text>
      )}

      <TextInput
        value={value}
        secureTextEntry={password && !showPass}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`border rounded-xl p-3 text-white ${
          error ? 'border-white' : isFocused ? 'border-white' : 'border-gray-600'
        } bg-black`}
        placeholderTextColor="#666"
        {...props}
      />

      {password && (
        <TouchableOpacity onPress={() => setShowPass(!showPass)} className="absolute right-4 top-[30%]">
          <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
        </TouchableOpacity>
      )}

      {error && <Text className="text-white text-xs mt-1">{error}</Text>}
    </View>
  );
};
