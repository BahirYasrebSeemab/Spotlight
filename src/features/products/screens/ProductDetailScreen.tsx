// app/product/[id]/index.tsx
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Package, Plus } from 'lucide-react-native';
import { useProductDetail } from '@/src/features/products/hooks/useProductDetails';
import { Spotlight } from '@/src/shared/components/Spotlight';
import type { ProductType } from '@/src/features/products/types/product.types';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: string; type: ProductType }>();

  const { data: product, isLoading, error } = useProductDetail(id, type);

  if (isLoading) {
    return (
      <Spotlight intensity={0.25}>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      </Spotlight>
    );
  }

  if (error || !product) {
    return (
      <Spotlight intensity={0.25}>
        <View className="flex-1 items-center justify-center bg-black px-8">
          <Text className="text-lg font-semibold text-white mb-2">Product not found</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-white px-6 py-3 rounded-xl">
            <Text className="text-black font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Spotlight>
    );
  }

  const isVerified = product.type === 'PROTOTYPE';

  return (
    <Spotlight intensity={0.25}>
      <ScrollView className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-800">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            {isVerified ? (
              <CheckCircle size={18} color="#FFF" fill="#FFF" />
            ) : (
              <View className="bg-gray-700 rounded-full p-1">
                <Package size={12} color="white" />
              </View>
            )}
            <Text className="ml-2 text-sm font-semibold text-gray-400">{isVerified ? 'Verified' : 'Community'}</Text>
          </View>
        </View>

        {/* Product Image */}
        <View className="w-full aspect-square bg-gray-900">
          <Image
            source={{
              uri: product.imageUrl || 'https://via.placeholder.com/400',
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View className="p-6">
          {/* Brand Name */}
          <Text className="text-sm font-semibold text-gray-400 mb-1">{product.brandName}</Text>

          {/* Product Name */}
          <Text className="text-2xl font-bold text-white mb-3">{product.name}</Text>

          {/* Price & Category */}
          <View className="flex-row items-center mb-4">
            {product.retailPrice && <Text className="text-xl font-bold text-white mr-4">${product.retailPrice}</Text>}
            {product.category && (
              <View className="bg-gray-900 px-3 py-1.5 rounded-full">
                <Text className="text-sm text-gray-400">{product.category}</Text>
              </View>
            )}
          </View>

          {/* SKU/UPC */}
          {(product.sku || product.upc) && (
            <View className="mb-4">
              {product.sku && <Text className="text-sm text-gray-500">SKU: {product.sku}</Text>}
              {product.upc && <Text className="text-sm text-gray-500">UPC: {product.upc}</Text>}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View className="mb-6">
              <Text className="text-base text-gray-300 leading-6">{product.description}</Text>
            </View>
          )}

          {/* Ownership Count */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500">
              {product.ownershipCount} {product.ownershipCount === 1 ? 'person owns' : 'people own'} this
            </Text>
          </View>

          {/* Add to Closet Button */}
          <TouchableOpacity
            onPress={() => {
              router.push(`/ownership/create?productId=${product.id}&type=${product.type}`);
            }}
            className="bg-white rounded-xl py-4 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Plus size={20} color="black" />
            <Text className="ml-2 text-black font-bold text-base">Add to Closet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Spotlight>
  );
}
