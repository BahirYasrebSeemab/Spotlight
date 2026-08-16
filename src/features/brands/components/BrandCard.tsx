// src/features/brands/components/BrandCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { VerifiedBadge } from '@/src/shared/ui';

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
        {brand.verified && <VerifiedBadge className="absolute -bottom-1 -right-1" />}
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
