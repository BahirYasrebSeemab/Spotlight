// src/features/brands/components/BrandCard.tsx
import React from 'react';
import { BadgeCheckIcon } from 'lucide-react-native';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import type { Brand } from '../types/brand.types';

interface BrandCardProps {
  brand: Brand;
  onPress: (brand: Brand) => void;
}

export function BrandCard({ brand, onPress }: BrandCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress(brand)}
      className="flex-row items-center p-4 border-b border-border"
      activeOpacity={0.7}
    >
      {/* Brand Logo */}
      <View className="relative">
        <Image
          source={{
            uri: brand.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=56`,
          }}
          className="w-14 h-14 rounded-full bg-muted"
        />
        {brand.verified && (
          <View className="absolute -bottom-1 -right-1">
            <View className="bg-black rounded-full p-0.1">
              <BadgeCheckIcon size={18} color="black" fill="white" />
            </View>
          </View>
        )}
      </View>

      {/* Brand Info */}
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-foreground">{brand.name}</Text>
        {brand.description && (
          <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
            {brand.description}
          </Text>
        )}
        <View className="mt-1">
          <Text className="text-xs text-muted-foreground uppercase">{brand.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
