// app/(app)/(tabs)/new/community-product.tsx
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Switch,
  StyleSheet,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { X, Sparkles, Info, Camera, ImageIcon, FlipHorizontal, Check } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Image as CompressorImage } from 'react-native-compressor';

import { InputField } from '@/src/shared/components/InputField';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { useCreateCommunityProduct } from '@/src/features/new/hooks/useCreateCommunityProduct';

export default function CommunityProductFormScreen() {
  const router = useRouter();

  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lastGalleryPhoto, setLastGalleryPhoto] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);

  // Form state
  const [name, setName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [upc, setUpc] = useState('');
  const [condition, setCondition] = useState('');
  const [processImage, setProcessImage] = useState(true);

  const { createCommunityProduct, isLoading, error } = useCreateCommunityProduct();

  useEffect(() => {
    loadLastGalleryPhoto();
  }, []);

  const loadLastGalleryPhoto = async () => {
    try {
      const perm = mediaPermission?.status === 'granted' ? mediaPermission : await requestMediaPermission();
      if (perm?.status !== 'granted') return;

      const assets = await MediaLibrary.getAssetsAsync({
        first: 1,
        mediaType: 'photo',
        sortBy: ['creationTime'],
      });
      if (assets.assets.length > 0) setLastGalleryPhoto(assets.assets[0].uri);
    } catch {}
  };

  const openGallery = async () => {
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
      setShowCamera(false);
      setCapturedImage(result.assets[0].uri);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo) {
        if (mediaPermission?.status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(photo.uri);
          setLastGalleryPhoto(photo.uri);
        }
        setCapturedImage(photo.uri);
        setShowCamera(false);
      }
    } catch {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permission Required', 'Camera access is needed to take photos');
        return;
      }
    }
    setShowCamera(true);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a product name');
      return;
    }
    if (!brandName.trim()) {
      Alert.alert('Required', 'Please enter a brand or maker name');
      return;
    }

    createCommunityProduct(
      { name, brandName, description, category, upc, condition, imageUri: capturedImage || undefined, processImage },
      {
        onSuccess: () => {
          Alert.alert('Added!', 'Your product has been added to your closet.', [
            { text: 'OK', onPress: () => router.replace('/(tabs)') },
          ]);
        },
        onError: (err: Error) => {
          Alert.alert('Error', err.message || 'Failed to create product');
        },
      },
    );
  };

  // ─── In-app camera ───────────────────────────────────────────────────────────
  if (showCamera) {
    return (
      <Spotlight intensity={0.2}>
        <View style={StyleSheet.absoluteFill}>
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />

          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Top bar */}
            <View className="absolute top-12 left-5 right-5 flex-row justify-between items-center z-10">
              {/* Gallery thumbnail */}
              <TouchableOpacity onPress={openGallery} className="bg-black/70 rounded-full p-1" activeOpacity={0.7}>
                {lastGalleryPhoto ? (
                  <Image source={{ uri: lastGalleryPhoto }} className="w-12 h-12 rounded-full" resizeMode="cover" />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center">
                    <ImageIcon size={20} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>

              {/* Close */}
              <TouchableOpacity
                onPress={() => setShowCamera(false)}
                className="bg-black/70 rounded-full p-3"
                activeOpacity={0.7}
              >
                <X size={22} color="#ffffff" />
              </TouchableOpacity>

              {/* Flip */}
              <TouchableOpacity
                onPress={() => setFacing(f => (f === 'back' ? 'front' : 'back'))}
                className="bg-black/70 rounded-full p-3"
                activeOpacity={0.7}
              >
                <FlipHorizontal size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Capture button */}
            <View className="absolute bottom-12 left-0 right-0 items-center">
              <TouchableOpacity
                onPress={takePicture}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/40 items-center justify-center"
                activeOpacity={0.8}
              >
                <View className="w-16 h-16 rounded-full bg-white" />
              </TouchableOpacity>
              <Text className="text-white text-sm mt-4 font-medium opacity-70">Tap to capture</Text>
            </View>
          </View>
        </View>
      </Spotlight>
    );
  }

  // ─── Main form ────────────────────────────────────────────────────────────────
  return (
    <Spotlight intensity={0.2}>
      <KeyboardAwareScrollView
        className="flex-1 bg-black"
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        <View className="flex-1 px-5 pt-12">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-2xl font-extrabold text-white">New Product</Text>
            <View className="w-10" />
          </View>

          {/* Photo section */}
          {capturedImage ? (
            <View className="mb-6 relative">
              <Image
                source={{ uri: capturedImage }}
                className="w-full h-64 rounded-2xl bg-white/5"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setCapturedImage(null)}
                className="absolute top-3 right-3 bg-black/70 rounded-full p-2"
                activeOpacity={0.7}
              >
                <X size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mb-6 flex-row gap-3">
              <TouchableOpacity
                onPress={handleOpenCamera}
                className="flex-1 h-36 rounded-2xl bg-white/5 border border-white/10 items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                <Camera size={28} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm font-medium">Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={openGallery}
                className="flex-1 h-36 rounded-2xl bg-white/5 border border-white/10 items-center justify-center gap-2"
                activeOpacity={0.7}
              >
                <ImageIcon size={28} color="#9CA3AF" />
                <Text className="text-gray-400 text-sm font-medium">Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* AI processing toggle */}
          {capturedImage && (
            <View className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Sparkles size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-base">Professional Photo</Text>
                  </View>
                  <Text className="text-gray-400 text-sm leading-5">
                    Remove background & add a clean studio backdrop
                  </Text>
                </View>
                <Switch
                  value={processImage}
                  onValueChange={setProcessImage}
                  trackColor={{ false: '#374151', true: '#ffffff' }}
                  thumbColor={processImage ? '#000000' : '#9CA3AF'}
                  ios_backgroundColor="#374151"
                />
              </View>
              {processImage && (
                <View className="flex-row items-start gap-2 mt-3 pt-3 border-t border-white/10">
                  <Info size={14} color="#9CA3AF" />
                  <Text className="flex-1 text-gray-400 text-xs leading-4">
                    AI will remove the background and add a studio backdrop to your photo
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Form */}
          <InputField
            label="Product Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Handmade Leather Jacket"
            editable={!isLoading}
          />

          <InputField
            label="Brand / Maker *"
            value={brandName}
            onChangeText={setBrandName}
            placeholder="Brand name, your name, or maker"
            editable={!isLoading}
          />

          <InputField
            label="Category (Optional)"
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Footwear, Apparel, Accessories"
            editable={!isLoading}
          />

          <InputField
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the product..."
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />

          <InputField
            label="UPC / Barcode (Optional)"
            value={upc}
            onChangeText={setUpc}
            placeholder="123456789012"
            keyboardType="numeric"
            editable={!isLoading}
          />

          <InputField
            label="Condition (Optional)"
            value={condition}
            onChangeText={setCondition}
            placeholder="e.g., New, Used, Deadstock"
            editable={!isLoading}
          />

          {/* Community note */}
          <View className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex-row items-start gap-3">
            <Info size={16} color="#9CA3AF" />
            <Text className="flex-1 text-gray-400 text-sm leading-5">
              This product will be added to the community database so others can find and own it too.
            </Text>
          </View>

          {/* Error */}
          {error && (
            <View className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-4">
              <Text className="text-red-400 font-semibold mb-1">Error</Text>
              <Text className="text-white text-sm">{error.message}</Text>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !name.trim() || !brandName.trim()}
            className={`w-full py-4 rounded-xl mb-4 ${
              isLoading || !name.trim() || !brandName.trim() ? 'bg-gray-700' : 'bg-white'
            }`}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center gap-2">
                <ActivityIndicator size="small" color="#000000" />
                <Text className="text-black font-semibold text-base">
                  {processImage && capturedImage ? 'Processing & adding...' : 'Adding to closet...'}
                </Text>
              </View>
            ) : (
              <Text className="text-black font-semibold text-base text-center">Add to Closet</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </Spotlight>
  );
}
