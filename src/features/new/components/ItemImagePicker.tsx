// ========================================
// src/features/new/components/ItemImagePicker.tsx
// Image picker component for item upload
// ========================================
import { View, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Image as ImageIcon } from 'lucide-react-native';

interface ItemImagePickerProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  disabled?: boolean;
}

export function ItemImagePicker({ imageUri, onImageSelected, onImageRemoved, disabled }: ItemImagePickerProps) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Permission to access camera is required!');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo');
    } finally {
      setLoading(false);
    }
  };

  if (imageUri) {
    return (
      <View className="relative">
        <Image source={{ uri: imageUri }} className="w-full h-64 rounded-2xl bg-gray-800" resizeMode="cover" />
        {!disabled && (
          <TouchableOpacity
            onPress={onImageRemoved}
            className="absolute top-2 right-2 bg-black/70 rounded-full p-2"
            activeOpacity={0.7}
          >
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={disabled || loading}
      className="w-full h-64 rounded-2xl bg-gray-800 border-2 border-dashed border-gray-600 items-center justify-center"
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : (
        <>
          <ImageIcon size={48} color="#666666" />
          <Text className="text-gray-400 mt-4 text-center px-4">
            Tap to add photo{'\n'}or take a picture
          </Text>
          <View className="flex-row gap-4 mt-4">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                pickImage();
              }}
              className="bg-white px-4 py-2 rounded-xl"
            >
              <Text className="text-black font-semibold">Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                takePhoto();
              }}
              className="bg-white px-4 py-2 rounded-xl"
            >
              <Camera size={16} color="#000000" style={{ marginRight: 4 }} />
              <Text className="text-black font-semibold">Camera</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}
