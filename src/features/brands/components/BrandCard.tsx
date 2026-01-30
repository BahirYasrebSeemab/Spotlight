// src/features/brands/components/BrandCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import type { Brand } from '../types/brand.types';

interface BrandCardProps {
  brand: Brand;
  onPress: (brand: Brand) => void;
}

export function BrandCard({ brand, onPress }: BrandCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(brand)}
      className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800"
      activeOpacity={0.7}
    >
      {/* Brand Logo */}
      <View className="relative">
        <Image
          source={{
            uri: brand.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=56`,
          }}
          className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-900"
        />
        {brand.verified && (
          <View className="absolute -bottom-1 -right-1">
            <CheckCircle size={16} color="#10B981" fill="#10B981" />
          </View>
        )}
      </View>

      {/* Brand Info */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-black dark:text-white">{brand.name}</Text>
        {brand.description && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1" numberOfLines={2}>
            {brand.description}
          </Text>
        )}
        <View className="mt-1">
          <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase">{brand.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
