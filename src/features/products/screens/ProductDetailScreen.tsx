// app/product/[id]/index.tsx
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Package, ShoppingBag } from 'lucide-react-native';
import { useProductDetail } from '@/src/features/products/hooks/useProductDetails';
import { Spotlight } from '@/src/shared/components/Spotlight';
import type { ProductType } from '@/src/features/products/types/product.types';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id, type } = useLocalSearchParams<{ id: string; type: ProductType }>();

  const { data: product, isLoading, error } = useProductDetail(id, type);

  if (isLoading) {
    return (
      <Spotlight>
        <View className="flex-1 items-center justify-center bg-white dark:bg-black">
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </Spotlight>
    );
  }

  if (error || !product) {
    return (
      <Spotlight>
        <View className="flex-1 items-center justify-center bg-white dark:bg-black px-8">
          <Text className="text-lg font-semibold text-black dark:text-white mb-2">Product not found</Text>
          <TouchableOpacity onPress={() => router.back()} className="mt-4">
            <Text className="text-violet-600 font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </Spotlight>
    );
  }

  const isVerified = product.type === 'PROTOTYPE';

  return (
    <Spotlight intensity={0.25}>
      <ScrollView className="flex-1 bg-white dark:bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <ArrowLeft size={24} color="#9CA3AF" />
          </TouchableOpacity>
          <View className="flex-row items-center">
            {isVerified ? (
              <CheckCircle size={20} color="#10B981" fill="#10B981" />
            ) : (
              <View className="bg-orange-500 rounded-full p-1">
                <Package size={12} color="white" />
              </View>
            )}
            <Text className="ml-2 text-sm font-semibold text-gray-600 dark:text-gray-400">
              {isVerified ? 'Verified' : 'Community'}
            </Text>
          </View>
        </View>

        {/* Product Image */}
        <View className="w-full aspect-square bg-gray-100 dark:bg-gray-900">
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
          <Text className="text-sm font-semibold text-violet-600 mb-1">{product.brandName}</Text>

          {/* Product Name */}
          <Text className="text-2xl font-bold text-black dark:text-white mb-3">{product.name}</Text>

          {/* Price & Category */}
          <View className="flex-row items-center mb-4">
            {product.retailPrice && (
              <Text className="text-xl font-bold text-black dark:text-white mr-4">${product.retailPrice}</Text>
            )}
            {product.category && (
              <View className="bg-gray-100 dark:bg-gray-900 px-3 py-1 rounded-full">
                <Text className="text-sm text-gray-600 dark:text-gray-400">{product.category}</Text>
              </View>
            )}
          </View>

          {/* SKU/UPC */}
          {(product.sku || product.upc) && (
            <View className="mb-4">
              {product.sku && <Text className="text-sm text-gray-500 dark:text-gray-500">SKU: {product.sku}</Text>}
              {product.upc && <Text className="text-sm text-gray-500 dark:text-gray-500">UPC: {product.upc}</Text>}
            </View>
          )}

          {/* Description */}
          {product.description && (
            <View className="mb-6">
              <Text className="text-base text-gray-700 dark:text-gray-300 leading-6">{product.description}</Text>
            </View>
          )}

          {/* Ownership Count */}
          <View className="mb-6">
            <Text className="text-sm text-gray-500 dark:text-gray-500">
              {product.ownershipCount} {product.ownershipCount === 1 ? 'person owns' : 'people own'} this
            </Text>
          </View>

          {/* Add to Closet Button */}
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to ownership form
              router.push(`/ownership/create?productId=${product.id}&type=${product.type}`);
            }}
            className="bg-violet-600 rounded-full py-4 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <ShoppingBag size={20} color="white" />
            <Text className="ml-2 text-white font-bold text-base">Add to Closet</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Spotlight>
  );
}
