// ========================================
// src/features/new/screens/NewItemScreen.tsx
// Main screen for adding new items to closet
// ========================================
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { ItemImagePicker } from '../components/ItemImagePicker';
import { BrandSearchInput } from '../components/BrandSearchInput';
import { ProductMatchCard } from '../components/ProductMatchCard';
import { useCreateItem, useSearchProducts } from '../hooks';
import { CreateItemPayload, ProductSearchResult, Brand } from '../types/item.types';
import { CheckCircle, X } from 'lucide-react-native';

export default function NewItemScreen() {
  const [form, setForm] = useState<CreateItemPayload>({
    name: '',
    brandName: '',
    upc: '',
    category: '',
    description: '',
    imageUri: undefined,
    condition: '',
    purchasePrice: undefined,
    purchaseDate: undefined,
    notes: '',
  });

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [showMatches, setShowMatches] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<ProductSearchResult | null>(null);

  const { createItem, isLoading, error, processingStatus, reset } = useCreateItem();
  const { data: productMatches, isLoading: searchingProducts } = useSearchProducts({
    name: form.name,
    brandName: form.brandName,
    upc: form.upc,
  });

  // Show matches when user has filled name and brand
  const shouldShowMatches = form.name.length > 2 && form.brandName.length > 2 && !selectedMatch;

  const handleSubmit = () => {
    // Validation
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
              // Reset form
              setForm({
                name: '',
                brandName: '',
                upc: '',
                category: '',
                description: '',
                imageUri: undefined,
                condition: '',
                purchasePrice: undefined,
                purchaseDate: undefined,
                notes: '',
              });
              setSelectedBrand(null);
              setSelectedMatch(null);
              reset();
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
    setShowMatches(false);
  };

  const handleUseNewProduct = () => {
    setSelectedMatch(null);
    setShowMatches(false);
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
          <Text className="text-3xl font-extrabold text-white mb-2">Add Item</Text>
          <Text className="text-gray-400 mb-6">Add a new item to your closet</Text>

          {/* Image Picker */}
          <ItemImagePicker
            imageUri={form.imageUri}
            onImageSelected={(uri) => setForm((prev) => ({ ...prev, imageUri: uri }))}
            onImageRemoved={() => setForm((prev) => ({ ...prev, imageUri: undefined }))}
            disabled={isLoading}
          />

          {/* Product Matches */}
          {shouldShowMatches && productMatches && productMatches.length > 0 && !selectedMatch && (
            <View className="mt-4 mb-4">
              <Text className="text-white font-semibold mb-3">Similar items found:</Text>
              {productMatches.slice(0, 3).map((match, index) => (
                <ProductMatchCard
                  key={`${match.type}-${match.product.id}-${index}`}
                  match={match}
                  onSelect={() => handleSelectMatch(match)}
                />
              ))}
              <TouchableOpacity
                onPress={handleUseNewProduct}
                className="mt-2 self-center"
              >
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
              isLoading || !form.name.trim() || !form.brandName.trim()
                ? 'bg-gray-600'
                : 'bg-white'
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
