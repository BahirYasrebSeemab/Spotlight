import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, Animated, Easing, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextInputProps } from 'react-native';

export interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  password?: boolean;
  value?: string;
}

export const InputField = ({ label, error, password, value, ...props }: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const theme = useColorScheme();
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute' as const,
    left: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [12, 7],
    }),
    top: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [9, -8],
    }),
    fontSize: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabel.interpolate({
      inputRange: [0, 1],
      outputRange: ['#666', '#999'],
    }),
    backgroundColor: '#000', // Always black background
    paddingHorizontal: 4,
  };

  return (
    <View className="mb-5 relative">
      {label && (<Animated.Text className="z-10" style={labelStyle}>
        {label}
      </Animated.Text>)}

      <TextInput
        value={value}
        secureTextEntry={password && !showPass}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`border rounded-xl p-3 text-white ${
          error
            ? 'border-white'
            : isFocused
              ? 'border-white'
              : 'border-gray-600'
        } bg-black`}
        placeholderTextColor="#666"
        {...props}
      />

      {password && (
        <TouchableOpacity onPress={() => setShowPass(!showPass)} className="absolute right-4 top-[30%]">
          <Ionicons
            name={showPass ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      )}

      {error && <Text className="text-white text-xs mt-1">{error}</Text>}
    </View>
  );
};
