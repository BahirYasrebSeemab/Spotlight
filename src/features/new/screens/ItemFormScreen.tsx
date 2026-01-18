// ========================================
// src/features/new/screens/ItemFormScreen.tsx
// Item form screen (navigated from camera)
// ========================================
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { InputField } from '@/src/shared/components/InputField';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { BrandSearchInput } from '../components/BrandSearchInput';
import { ProductMatchCard } from '../components/ProductMatchCard';
import { useCreateItem, useSearchProducts } from '../hooks';
import { CreateItemPayload, ProductSearchResult, Brand } from '../types/item.types';
import { CheckCircle, X } from 'lucide-react-native';

export default function ItemFormScreen() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();
  const [form, setForm] = useState<CreateItemPayload>({
    name: '',
    brandName: '',
    upc: '',
    category: '',
    description: '',
    imageUri: params.imageUri,
    condition: '',
    purchasePrice: undefined,
    purchaseDate: undefined,
    notes: '',
  });

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ProductSearchResult | null>(null);

  const { createItem, isLoading, error, processingStatus, reset } = useCreateItem();
  const { data: productMatches } = useSearchProducts({
    name: form.name,
    brandName: form.brandName,
    upc: form.upc,
  });

  const shouldShowMatches = form.name.length > 2 && form.brandName.length > 2 && !selectedMatch;

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter item name');
      return;
    }
    if (!form.brandName.trim()) {
      Alert.alert('Required', 'Please enter brand name');
      return;
    }

    createItem(form, {
      onSuccess: () => {
        Alert.alert('Success', 'Item added to your closet!', [
          {
            text: 'OK',
            onPress: () => {
              router.back();
            },
          },
        ]);
      },
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to add item');
      },
    });
  };

  const handleSelectMatch = (match: ProductSearchResult) => {
    setSelectedMatch(match);
    const product = match.product;
    setForm((prev) => ({
      ...prev,
      name: product.name,
      brandName: match.type === 'prototype' ? (product as any).brand?.name : (product as any).brandName,
      upc: product.upc || prev.upc,
      category: product.category || prev.category,
    }));
  };

  const handleUseNewProduct = () => {
    setSelectedMatch(null);
  };

  return (
    <Spotlight intensity={0.2}>
      <KeyboardAwareScrollView
        className="flex-1 bg-black"
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
      >
        <View className="flex-1 px-5 pt-12">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2">
              <X size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text className="text-2xl font-extrabold text-white">Add Item</Text>
            <View className="w-10" />
          </View>

          {/* Image Preview */}
          {form.imageUri && (
            <View className="mb-6 relative">
              <Image source={{ uri: form.imageUri }} className="w-full h-64 rounded-2xl bg-gray-800" resizeMode="cover" />
              <TouchableOpacity
                onPress={() => setForm((prev) => ({ ...prev, imageUri: undefined }))}
                className="absolute top-2 right-2 bg-black/70 rounded-full p-2"
                activeOpacity={0.7}
              >
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Product Matches */}
          {shouldShowMatches && productMatches && productMatches.length > 0 && !selectedMatch && (
            <View className="mb-4">
              <Text className="text-white font-semibold mb-3">Similar items found:</Text>
              {productMatches.slice(0, 3).map((match, index) => (
                <ProductMatchCard
                  key={`${match.type}-${match.product.id}-${index}`}
                  match={match}
                  onSelect={() => handleSelectMatch(match)}
                />
              ))}
              <TouchableOpacity onPress={handleUseNewProduct} className="mt-2 self-center">
                <Text className="text-gray-400 text-sm">Use new product instead</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Selected Match Indicator */}
          {selectedMatch && (
            <View className="bg-white/10 rounded-xl p-3 mb-4 flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white font-semibold">Using: {selectedMatch.product.name}</Text>
                <Text className="text-gray-400 text-sm">
                  {selectedMatch.type === 'prototype' ? 'Verified Product' : 'Community Product'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleUseNewProduct}>
                <X size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* Form Fields */}
          <InputField
            label="Item Name"
            value={form.name}
            onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
            placeholder="e.g., Air Force 1 Low"
            editable={!isLoading}
          />

          <BrandSearchInput
            value={form.brandName}
            onChangeText={(text) => setForm((prev) => ({ ...prev, brandName: text }))}
            onBrandSelect={(brand) => setSelectedBrand(brand)}
            placeholder="Brand name"
          />

          <InputField
            label="UPC/Barcode (Optional)"
            value={form.upc}
            onChangeText={(text) => setForm((prev) => ({ ...prev, upc: text }))}
            placeholder="123456789012"
            keyboardType="numeric"
            editable={!isLoading}
          />

          <InputField
            label="Category (Optional)"
            value={form.category}
            onChangeText={(text) => setForm((prev) => ({ ...prev, category: text }))}
            placeholder="e.g., Shoes, Shirt, Pants"
            editable={!isLoading}
          />

          <InputField
            label="Description (Optional)"
            value={form.description}
            onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
            placeholder="Add any additional details"
            multiline
            numberOfLines={3}
            editable={!isLoading}
          />

          {/* Processing Status */}
          {processingStatus === 'processing' && (
            <View className="bg-white/10 rounded-xl p-4 mb-4 flex-row items-center">
              <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 12 }} />
              <Text className="text-white">Processing image...</Text>
            </View>
          )}

          {processingStatus === 'completed' && (
            <View className="bg-white/10 rounded-xl p-4 mb-4 flex-row items-center">
              <CheckCircle size={20} color="#ffffff" style={{ marginRight: 12 }} />
              <Text className="text-white">Image processed successfully!</Text>
            </View>
          )}

          {processingStatus === 'failed' && (
            <View className="bg-white/10 rounded-xl p-4 mb-4">
              <Text className="text-white">Image processing failed. Your item was still added.</Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View className="bg-white/10 rounded-xl p-4 mb-4">
              <Text className="text-white">{error.message}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !form.name.trim() || !form.brandName.trim()}
            className={`w-full py-4 rounded-xl mb-4 ${
              isLoading || !form.name.trim() || !form.brandName.trim() ? 'bg-gray-600' : 'bg-white'
            }`}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#000000" style={{ marginRight: 8 }} />
                <Text className="text-black font-semibold text-base">Adding item...</Text>
              </View>
            ) : (
              <Text className="text-black font-semibold text-base text-center">Add to Closet</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </Spotlight>
  );
}
