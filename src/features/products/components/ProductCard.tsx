// src/features/products/components/ProductCard.tsx
import React from 'react';
import { BadgeCheckIcon, Package } from 'lucide-react-native';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import type { Product } from '../types/product.types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export function ProductCard({ onPress, product }: ProductCardProps) {
  const isVerified = product.type === 'PROTOTYPE';

  return (
    <TouchableOpacity
      onPress={() => onPress(product)}
      className="flex-row items-center p-4 border-b border-border"
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View className="relative">
        <Image
          source={{
            uri: product.thumbnailUrl || product.imageUrl || 'https://via.placeholder.com/60',
          }}
          className="w-16 h-16 rounded-lg bg-muted"
        />
        {/* Type Badge */}
        <View className="absolute -top-1 -right-1">
          {isVerified ? (
            <View className="bg-black rounded-full p-0.1">
              <BadgeCheckIcon size={18} color="black" fill="white" />
            </View>
          ) : (
            <View className="bg-gray-500 rounded-full p-1">
              <Package size={10} color="white" />
            </View>
          )}
        </View>
      </View>

      {/* Product Info */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {product.brandName}
        </Text>

        {/* Category & Price */}
        <View className="flex-row items-center mt-1">
          {product.category && <Text className="text-xs text-muted-foreground">{product.category}</Text>}
          {product.retailPrice && <Text className="text-xs text-muted-foreground ml-2">${product.retailPrice}</Text>}
        </View>

        {/* Ownership Count */}
        {product.ownershipCount > 0 && (
          <Text className="text-xs text-muted-foreground mt-1">
            {product.ownershipCount} owner{product.ownershipCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
