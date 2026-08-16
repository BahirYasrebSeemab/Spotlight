// ========================================
// src/features/new/components/ProductMatchCard.tsx
// Shows matched product when searching
// ========================================
import { CheckCircle } from 'lucide-react-native';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { ProductSearchResult } from '../types/item.types';

interface ProductMatchCardProps {
  onSelect: () => void;
  match: ProductSearchResult;
}

export function ProductMatchCard({ match, onSelect }: ProductMatchCardProps) {
  const product = match.product;
  const isPrototype = match.type === 'prototype';
  const imageUrl = isPrototype ? (product as any).imageUrl : (product as any).imageUrl;

  return (
    <TouchableOpacity
      onPress={onSelect}
      className="bg-gray-800 rounded-xl p-4 mb-3 border border-gray-700"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-16 h-16 rounded-lg bg-gray-700 mr-3" resizeMode="cover" />
        ) : (
          <View className="w-16 h-16 rounded-lg bg-gray-700 mr-3 items-center justify-center">
            <Text className="text-gray-400 text-xs">No Image</Text>
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-white font-semibold text-base flex-1">{product.name}</Text>
            {isPrototype && (
              <View className="bg-white/20 px-2 py-1 rounded">
                <Text className="text-white text-xs">Verified</Text>
              </View>
            )}
          </View>

          <Text className="text-gray-400 text-sm mb-1">
            {isPrototype ? (product as any).brand?.name : (product as any).brandName}
          </Text>

          {match.similarity && (
            <View className="flex-row items-center mt-1">
              <CheckCircle size={14} color="#ffffff" />
              <Text className="text-gray-400 text-xs ml-1">{match.similarity}% match</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
