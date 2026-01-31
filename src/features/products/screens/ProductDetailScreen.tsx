// ========================================
// src/features/products/screens/ProductDetailScreen.tsx
// Product detail with "Add to Closet" button
// ========================================
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';

import { Spotlight } from '@/src/shared/components/Spotlight';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { useProductDetails } from '../hooks/useProductDetails';

export default function ProductDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: product, isLoading } = useProductDetails(params.id);

  const handleAddToCloset = () => {
    if (!product) return;

    // Determine product type
    const productType = product.prototypeId ? 'prototype' : 'community';

    // Navigate to ownership creation
    router.push({
      pathname: '/ownership/create',
      params: {
        productId: params.id,
        type: productType,
      },
    });
  };

  if (isLoading) {
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
          <Text className="text-white text-lg text-center mb-4">Product not found</Text>
          <TouchableOpacity onPress={() => router.back()} className="bg-white px-6 py-3 rounded-xl">
            <Text className="text-black font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Spotlight>
    );
  }

  const brandName = product.brand?.name || product.brandName || 'Unknown Brand';
  const isVerified = !!product.verified;
  const variants = product.variants || {};

  return (
    <Spotlight intensity={0.25}>
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="px-5 pt-12 pb-4 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-3">Product</Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Product Image */}
          <View className="px-5 mb-6">
            <Image
              source={{ uri: product.imageUrl }}
              className="w-full h-96 rounded-2xl bg-white/5"
              resizeMode="cover"
              defaultSource={require('@/assets/placeholder.png')}
            />
          </View>

          {/* Product Info */}
          <View className="px-5">
            {/* Brand Badge */}
            <View className="flex-row items-center mb-2">
              <View
                className={`px-3 py-1 rounded-full ${
                  isVerified ? 'bg-white' : 'bg-white/10'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    isVerified ? 'text-black' : 'text-white'
                  }`}
                >
                  {isVerified ? '✓ Verified Brand' : 'Community Product'}
                </Text>
              </View>
            </View>

            {/* Product Name */}
            <Text className="text-white text-3xl font-extrabold mb-2">
              {product.name}
            </Text>

            {/* Brand Name */}
            <Text className="text-gray-400 text-xl mb-6">{brandName}</Text>

            {/* Description */}
            {product.description && (
              <View className="mb-6">
                <Text className="text-white text-base leading-6">
                  {product.description}
                </Text>
              </View>
            )}

            {/* Category */}
            {product.category && (
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-1">Category</Text>
                <Text className="text-white text-base font-medium">
                  {product.category}
                </Text>
              </View>
            )}

            {/* Variants */}
            {(variants.sizes?.length > 0 || variants.colors?.length > 0) && (
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-3">Available Variants</Text>

                {variants.sizes?.length > 0 && (
                  <View className="mb-3">
                    <Text className="text-white text-sm mb-2 font-medium">Sizes</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {variants.sizes.map((size: string) => (
                        <View
                          key={size}
                          className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
                        >
                          <Text className="text-white text-sm">{size}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {variants.colors?.length > 0 && (
                  <View>
                    <Text className="text-white text-sm mb-2 font-medium">Colors</Text>
                    <View className="flex-row flex-wrap gap-2">
                      {variants.colors.map((color: string) => (
                        <View
                          key={color}
                          className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20"
                        >
                          <Text className="text-white text-sm">{color}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* UPC */}
            {product.upc && (
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-1">UPC/Barcode</Text>
                <Text className="text-white text-base font-mono">{product.upc}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/95 border-t border-white/10 px-5 py-4">
          <PrimaryButton onPress={handleAddToCloset}>
            <View className="flex-row items-center justify-center gap-2">
              <Plus size={20} color="#000000" />
              <Text className="text-black font-semibold text-base">Add to Closet</Text>
            </View>
          </PrimaryButton>
        </View>
      </View>
    </Spotlight>
  );
}
