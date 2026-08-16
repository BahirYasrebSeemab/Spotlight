import Modal from 'react-native-modal';
import React, { useState } from 'react';
import { BlurView } from '@react-native-community/blur';
import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';

interface BlurConfirmModalProps {
  title?: string;
  message: string;
  visible: boolean;
  confirmText?: string; // e.g. "DELETE"
  onCancel: () => void;
  onConfirm: () => void;
}

export default function BlurConfirmModal({
  confirmText = 'DELETE',
  message,
  onCancel,
  onConfirm,
  title = 'Are you absolutely sure?',
  visible,
}: BlurConfirmModalProps) {
  const [inputValue, setInputValue] = useState('');

  const isConfirmed = inputValue.trim().toUpperCase() === confirmText;

  return (
    <Modal
      isVisible={visible}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropOpacity={0}
      onBackdropPress={onCancel}
      useNativeDriver
    >
      <View className="flex-1 justify-center items-center">
        {/* Background */}
        {Platform.OS === 'ios' ? (
          <BlurView style={{ inset: 0, position: 'absolute' }} blurType="dark" blurAmount={18} />
        ) : (
          <View className="absolute inset-0 bg-black/70" />
        )}

        {/* Card */}
        <View className="w-[85%] rounded-2xl bg-card p-6">
          {/* Title */}
          <Text className="text-xl font-bold text-card-foreground mb-2">{title}</Text>

          {/* Message */}
          <Text className="text-base text-muted-foreground mb-5">{message}</Text>

          {/* Input hint */}
          <Text className="text-sm text-muted-foreground mb-2">
            Type <Text className="font-bold">{confirmText}</Text> to confirm
          </Text>

          {/* Input */}
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            autoCapitalize="characters"
            placeholder={confirmText}
            placeholderTextColor="#999"
            className="border border-border rounded-lg px-4 py-3 mb-5 text-card-foreground"
          />

          {/* Actions */}
          <View className="flex-row justify-end gap-4">
            <TouchableOpacity onPress={onCancel} className="px-5 py-3 rounded-xl bg-muted">
              <Text className="text-muted-foreground font-medium">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={!isConfirmed}
              className={`px-5 py-3 rounded-xl ${isConfirmed ? 'bg-red-600' : 'bg-red-300'}`}
            >
              <Text className="text-white font-bold">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
