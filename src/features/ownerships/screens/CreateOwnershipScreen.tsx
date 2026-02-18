// ========================================
// src/features/ownership/screens/CreateOwnershipScreen.tsx
// FIXED: Now sends processImage correctly
// ========================================
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Switch } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, Sparkles, Info } from 'lucide-react-native';

import { Spotlight } from '@/src/shared/components/Spotlight';
import { InputField } from '@/src/shared/components/InputField';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { useProductDetails } from '@/src/features/products/hooks/useProductDetails';
import { useCreateOwnership } from '../hooks/useCreateOwnership';
import { CreateOwnershipPayload } from '../types/ownership.types';
import { useAppSelector } from '@/src/shared/hooks/redux';

const CONDITIONS = ['new', 'like-new', 'good', 'fair', 'poor'] as const;

export default function CreateOwnershipScreen() {
  const params = useLocalSearchParams<{ productId: string; type: 'PROTOTYPE' | 'COMMUNITY' }>();
  const router = useRouter();
  const authUser = useAppSelector(state => state.auth.user);

  const { data: product, isLoading: loadingProduct } = useProductDetails(params.productId, params.type);
  const { mutate: createOwnership, isPending } = useCreateOwnership();

  const [useOfficialImage, setUseOfficialImage] = useState(true);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [processImage, setProcessImage] = useState(true); // ← ADDED: Default to TRUE
  const [condition, setCondition] = useState<(typeof CONDITIONS)[number] | ''>('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [notes, setNotes] = useState('');

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCustomImage(result.assets[0].uri);
      setUseOfficialImage(false);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCustomImage(result.assets[0].uri);
      setUseOfficialImage(false);
    }
  };

const handleSubmit = () => {
  if (!product || !authUser) return;

  const payload: CreateOwnershipPayload & { processImage?: boolean; userId?: string } = {
    userId: authUser.id, // ← ADD THIS
    prototypeId: params.type === 'PROTOTYPE' ? params.productId : undefined,
    communityProductId: params.type === 'COMMUNITY' ? params.productId : undefined,
    useOfficialImage,
    originalImageUrl: !useOfficialImage ? customImage || undefined : undefined,
    condition: condition || undefined,
    purchaseDate: purchaseDate || undefined,
    purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
    selectedVariant:
      selectedSize || selectedColor
        ? {
            size: selectedSize || undefined,
            color: selectedColor || undefined,
          }
        : undefined,
    notes: notes || undefined,
    status: 'owned',
    processImage: !useOfficialImage ? processImage : undefined,
  };

  console.log('Submitting payload:', payload);

  createOwnership(payload, {
    onSuccess: () => {
      Alert.alert('Success!', 'Item added to your closet', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    },
    onError: error => {
      Alert.alert('Error', error.message);
      console.error('Create ownership error:', error);
    },
  });
};

  if (loadingProduct) {
    return (
      <Spotlight intensity={0.25}>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Spotlight>
    );
  }

  if (!product) {
    return (
      <Spotlight intensity={0.25}>
        <View className="flex-1 items-center justify-center bg-black px-6">
          <Text className="text-white text-lg text-center">Product not found</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-white px-6 py-3 rounded-xl">
            <Text className="text-black font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Spotlight>
    );
  }

  const displayImage = useOfficialImage ? product.imageUrl : customImage || product.imageUrl || '';

  // Parse variants from product
  const variants = product.variants || {};
  const sizes = variants.sizes || [];
  const colors = variants.colors || [];

  return (
    <Spotlight intensity={0.25}>
      <KeyboardAwareScrollView
        className="flex-1 bg-black"
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="px-5 pt-12 pb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <X size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-2xl font-extrabold text-white">Add to Closet</Text>
          <View className="w-10" />
        </View>

        <View className="px-5">
          {/* Product Preview */}
          <View className="mb-6 bg-white/5 rounded-2xl overflow-hidden">
            <Image
              source={{ uri: displayImage || undefined }}
              className="w-full h-72"
              resizeMode="cover"
              defaultSource={require('@/assets/images/placeholder-spotlight.png')}
            />
            <View className="p-4">
              <Text className="text-white font-bold text-lg">{product.name}</Text>
              <Text className="text-gray-400 text-sm mt-1">{product.brandName}</Text>
            </View>
          </View>

          {/* Image Choice Section */}
          <View className="mb-6">
            <Text className="text-white font-semibold text-base mb-3">Item Photo</Text>

            {/* Image Choice Toggle */}
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                onPress={() => {
                  setUseOfficialImage(true);
                  setCustomImage(null);
                }}
                className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                  useOfficialImage ? 'bg-white border-white' : 'bg-transparent border-white/20'
                }`}
              >
                <Text className={`text-center font-semibold ${useOfficialImage ? 'text-black' : 'text-white'}`}>
                  Use Brand Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setUseOfficialImage(false)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 ${
                  !useOfficialImage ? 'bg-white border-white' : 'bg-transparent border-white/20'
                }`}
              >
                <Text className={`text-center font-semibold ${!useOfficialImage ? 'text-black' : 'text-white'}`}>
                  Upload My Photo
                </Text>
              </TouchableOpacity>
            </View>

            {/* Camera/Gallery Buttons (only show when custom photo selected) */}
            {!useOfficialImage && (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleTakePhoto}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 border border-white/20 flex-row items-center justify-center gap-2"
                >
                  <Camera size={20} color="#ffffff" />
                  <Text className="text-white font-medium">Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handlePickImage}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 border border-white/20 flex-row items-center justify-center gap-2"
                >
                  <Text className="text-white font-medium">Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ← ADDED: Professional Photo Processing Toggle */}
          {!useOfficialImage && customImage && (
            <View className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <Sparkles size={18} color="#ffffff" />
                    <Text className="text-white font-bold text-base">Professional Photo</Text>
                  </View>
                  <Text className="text-gray-400 text-sm leading-5">
                    Remove background & add clean white backdrop with shadow
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

              {/* Info */}
              {processImage && (
                <View className="flex-row items-start gap-2 mt-3 pt-3 border-t border-white/10 bg-white/5 rounded-xl p-3">
                  <Info size={16} color="#9CA3AF" className="mt-0.5" />
                  <Text className="flex-1 text-gray-400 text-xs leading-4">
                    Your photo will be professionally processed: background removed, subtle shadow added, clean white
                    backdrop (or light gray for white items)
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Condition Picker */}
          <View className="mb-6">
            <Text className="text-white font-semibold text-base mb-3">Condition</Text>
            <View className="flex-row flex-wrap gap-2">
              {CONDITIONS.map(cond => (
                <TouchableOpacity
                  key={cond}
                  onPress={() => setCondition(cond)}
                  className={`py-2 px-4 rounded-xl border ${
                    condition === cond ? 'bg-white border-white' : 'bg-transparent border-white/20'
                  }`}
                >
                  <Text className={`font-medium capitalize ${condition === cond ? 'text-black' : 'text-white'}`}>
                    {cond.replace('-', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Size Picker (if available) */}
          {sizes.length > 0 && (
            <View className="mb-6">
              <Text className="text-white font-semibold text-base mb-3">Size</Text>
              <View className="flex-row flex-wrap gap-2">
                {sizes.map((size: string) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => setSelectedSize(size)}
                    className={`py-2 px-4 rounded-xl border ${
                      selectedSize === size ? 'bg-white border-white' : 'bg-transparent border-white/20'
                    }`}
                  >
                    <Text className={`font-medium ${selectedSize === size ? 'text-black' : 'text-white'}`}>{size}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Color Picker (if available) */}
          {colors.length > 0 && (
            <View className="mb-6">
              <Text className="text-white font-semibold text-base mb-3">Color</Text>
              <View className="flex-row flex-wrap gap-2">
                {colors.map((color: string) => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    className={`py-2 px-4 rounded-xl border ${
                      selectedColor === color ? 'bg-white border-white' : 'bg-transparent border-white/20'
                    }`}
                  >
                    <Text className={`font-medium ${selectedColor === color ? 'text-black' : 'text-white'}`}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Purchase Date */}
          <InputField
            label="Purchase Date (Optional)"
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            placeholder="YYYY-MM-DD"
            editable={!isPending}
          />

          {/* Purchase Price */}
          <InputField
            label="Purchase Price (Optional)"
            value={purchasePrice}
            onChangeText={setPurchasePrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
            editable={!isPending}
          />

          {/* Notes */}
          <InputField
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes about this item..."
            multiline
            numberOfLines={4}
            editable={!isPending}
          />

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending}
            className={`w-full py-4 rounded-xl mb-4 ${isPending ? 'bg-gray-600' : 'bg-white'}`}
            activeOpacity={0.7}
          >
            {isPending ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#000000" style={{ marginRight: 8 }} />
                <Text className="text-black font-semibold text-base">
                  {processImage && !useOfficialImage ? 'Processing & adding...' : 'Adding to closet...'}
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
