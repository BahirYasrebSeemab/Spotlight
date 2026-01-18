// ========================================
// src/features/new/components/BrandSearchInput.tsx
// Brand search/autocomplete input
// ========================================
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useSearchBrands } from '../hooks/useSearchBrands';
import { Brand } from '../types/item.types';

interface BrandSearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onBrandSelect?: (brand: Brand) => void;
  placeholder?: string;
}

export function BrandSearchInput({ value, onChangeText, onBrandSelect, placeholder = 'Brand name' }: BrandSearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: brands, isLoading } = useSearchBrands(value);

  const handleSelectBrand = (brand: Brand) => {
    onChangeText(brand.name);
    setShowSuggestions(false);
    onBrandSelect?.(brand);
  };

  return (
    <View className="relative mb-5">
      <TextInput
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setShowSuggestions(text.length > 0);
        }}
        onFocus={() => setShowSuggestions(value.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        placeholderTextColor="#666"
        className="border rounded-xl p-3 text-white bg-black border-gray-600"
        autoCapitalize="words"
      />

      {showSuggestions && brands && brands.length > 0 && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl max-h-48 z-50">
          {isLoading ? (
            <View className="p-4 items-center">
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : (
            <FlatList
              data={brands}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectBrand(item)}
                  className="px-4 py-3 border-b border-gray-800 active:bg-gray-800"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-medium">{item.name}</Text>
                    {item.verified && (
                      <View className="bg-white/20 px-2 py-1 rounded">
                        <Text className="text-white text-xs">Verified</Text>
                      </View>
                    )}
                  </View>
                  {item.type && (
                    <Text className="text-gray-400 text-xs mt-1">{item.type}</Text>
                  )}
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      )}
    </View>
  );
}
