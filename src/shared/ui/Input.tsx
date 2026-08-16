import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { View, TextInput, TextInputProps, Text, TouchableOpacity, Animated, Easing } from 'react-native';

import { cn } from './cn';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  value?: string;
  password?: boolean;
  className?: string;
}

export const Input = ({ label, error, password, value, className, ...props }: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const animatedLabel = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedLabel, {
      toValue: isFocused || !!value ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedLabel]);

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
    backgroundColor: '#000',
    paddingHorizontal: 4,
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
        className={cn(
          'border rounded-xl p-3 text-foreground bg-background',
          error ? 'border-destructive' : isFocused ? 'border-foreground' : 'border-border',
          className,
        )}
        placeholderTextColor="#666"
        {...props}
      />

      {password && (
        <TouchableOpacity onPress={() => setShowPass(!showPass)} className="absolute right-4 top-[30%]">
          <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
        </TouchableOpacity>
      )}

      {error && <Text className="text-destructive-foreground text-xs mt-1">{error}</Text>}
    </View>
  );
};
