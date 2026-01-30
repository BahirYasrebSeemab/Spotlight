// src/features/products/components/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { CheckCircle, Package } from 'lucide-react-native';
import type { Product } from '../types/product.types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const isVerified = product.type === 'PROTOTYPE';

  return (
    <TouchableOpacity
      onPress={() => onPress(product)}
      className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800"
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View className="relative">
        <Image
          source={{
            uri: product.thumbnailUrl || product.imageUrl || 'https://via.placeholder.com/60',
          }}
          className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-900"
        />
        {/* Type Badge */}
        <View className="absolute -top-1 -right-1">
          {isVerified ? (
            <CheckCircle size={18} color="#10B981" fill="#10B981" />
          ) : (
            <View className="bg-orange-500 rounded-full p-1">
              <Package size={10} color="white" />
            </View>
          )}
        </View>
      </View>

      {/* Product Info */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-black dark:text-white" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400" numberOfLines={1}>
          {product.brandName}
        </Text>

        {/* Category & Price */}
        <View className="flex-row items-center mt-1">
          {product.category && <Text className="text-xs text-gray-400 dark:text-gray-500">{product.category}</Text>}
          {product.retailPrice && (
            <Text className="text-xs text-gray-400 dark:text-gray-500 ml-2">${product.retailPrice}</Text>
          )}
        </View>

        {/* Ownership Count */}
        {product.ownershipCount > 0 && (
          <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {product.ownershipCount} owner{product.ownershipCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
