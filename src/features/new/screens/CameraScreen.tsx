// ========================================
// src/features/new/screens/CameraScreen.tsx
// Main camera screen for New tab
// ========================================
import { View, Text, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { ImageIcon, X, FlipHorizontal } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Image as CompressorImage } from 'react-native-compressor';

export default function CameraScreen() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastGalleryPhoto, setLastGalleryPhoto] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCompressing, setIsCompressing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Get last photo from gallery
  useEffect(() => {
    loadLastGalleryPhoto();
  }, []);

  const loadLastGalleryPhoto = async () => {
    try {
      // Request permission if not granted
      if (mediaLibraryPermission?.status !== 'granted') {
        const { status } = await requestMediaLibraryPermission();
        if (status !== 'granted') {
          console.log('Media library permission not granted');
          return;
        }
      }

      // Get the last photo from the gallery
      const assets = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: 'photo',
        sortBy: ['creationTime'],
      });

      if (assets.assets.length > 0) {
        setLastGalleryPhoto(assets.assets[0].uri);
      }
    } catch (error) {
      console.error('Error loading gallery photo:', error);
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening gallery:', error);
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo) {
        setCapturedImage(photo.uri);

        // Optionally save to gallery and update the last photo thumbnail
        if (mediaLibraryPermission?.status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          setLastGalleryPhoto(photo.uri);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleAddItem = async () => {
    if (!capturedImage) return;

    try {
      setIsCompressing(true);

      // Compress the image before passing to the form
      const compressedImage = await CompressorImage.compress(capturedImage, {
        compressionMethod: 'auto',
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.8,
      });

      // Navigate to item form with compressed image
      router.push({
        pathname: '/(app)/(tabs)/new/item-form',
        params: { imageUri: compressedImage },
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddMemory = () => {
    // Future feature - for now just show alert
    Alert.alert('Coming Soon', 'Memory feature will be available soon!');
  };

  const resetCamera = () => {
    setCapturedImage(null);
  };

  // Handle camera permissions
  if (!permission) {
    // Camera permissions are still loading
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black items-center justify-center px-8">
          <Text className="text-white text-xl font-semibold mb-4 text-center">Camera Access Required</Text>
          <Text className="text-gray-400 text-center mb-8">We need your permission to use the camera</Text>
          <TouchableOpacity onPress={requestPermission} className="bg-white py-4 px-8 rounded-xl" activeOpacity={0.7}>
            <Text className="text-black font-semibold text-center">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </Spotlight>
    );
  }

  // Show captured image with options
  if (capturedImage) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black">
          <Image source={{ uri: capturedImage }} className="flex-1" resizeMode="contain" />

          {/* Top bar */}
          <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center">
            <TouchableOpacity onPress={resetCamera} className="bg-black/70 rounded-full p-3" activeOpacity={0.7}>
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bottom options */}
          <View className="absolute bottom-12 left-5 right-5">
            <View className="bg-black/70 rounded-2xl p-6">
              <Text className="text-white font-semibold text-lg mb-4 text-center">What would you like to add?</Text>

              <TouchableOpacity
                onPress={handleAddItem}
                disabled={isCompressing}
                className={`py-4 rounded-xl mb-3 ${isCompressing ? 'bg-gray-600' : 'bg-white'}`}
                activeOpacity={0.7}
              >
                <Text className="text-black font-semibold text-center text-base">
                  {isCompressing ? 'Processing...' : 'Add Item'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAddMemory}
                className="bg-gray-800 py-4 rounded-xl border border-gray-600"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold text-center text-base">Add Memory (Coming Soon)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Spotlight>
    );
  }

  // Camera view with live preview - NO CHILDREN INSIDE CameraView!
  return (
    <Spotlight intensity={0.2}>
      <View style={StyleSheet.absoluteFill}>
        {/* CameraView takes full screen - NO CHILDREN */}
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

        {/* UI elements positioned OUTSIDE and ABOVE the camera using absolute positioning */}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {/* Top bar with gallery and flip icons */}
          <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center z-10">
            <TouchableOpacity onPress={openGallery} className="bg-black/70 rounded-full p-2" activeOpacity={0.7}>
              {lastGalleryPhoto ? (
                <Image source={{ uri: lastGalleryPhoto }} className="w-12 h-12 rounded-full" resizeMode="cover" />
              ) : (
                <View className="w-12 h-12 rounded-full bg-gray-800 items-center justify-center">
                  <ImageIcon size={20} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleCameraFacing} className="bg-black/70 rounded-full p-3" activeOpacity={0.7}>
              <FlipHorizontal size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Bottom capture button */}
          <View className="absolute bottom-12 left-0 right-0 items-center">
            <TouchableOpacity
              onPress={takePicture}
              className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 items-center justify-center"
              activeOpacity={0.8}
            >
              <View className="w-16 h-16 rounded-full bg-white" />
            </TouchableOpacity>
            <Text className="text-white text-sm mt-4">Take Photo</Text>
          </View>
        </View>
      </View>
    </Spotlight>
  );
}
