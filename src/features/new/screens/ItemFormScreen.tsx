import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Sparkles, Info, AlertCircle } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Image, Switch } from 'react-native';

import { InputField } from '@/src/shared/components/InputField';
import { BackgroundPicker } from '@/src/shared/components/BackgroundPicker';

import { useCreateItem, useSearchProducts } from '../hooks';
import { BrandSearchInput } from '../components/BrandSearchInput';
import { ProductMatchCard } from '../components/ProductMatchCard';
import { CreateItemPayload, ProductSearchResult, Brand } from '../types/item.types';

interface ItemFormParams {
  imageUri?: string;
}

interface ItemFormState extends CreateItemPayload {
  upc: string;
  name: string;
  notes: string;
  category: string;
  brandName: string;
  imageUri?: string;
  condition: string;
  description: string;
  purchaseDate?: string;
  purchasePrice?: number;
}

interface ProcessingSettings {
  processImage: boolean;
  backgroundType: string;
}

export default function ItemFormScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState<ItemFormState>({
    brandName: '',
    category: '',
    condition: '',
    description: '',
    imageUri: params.imageUri as string | undefined,
    name: '',
    notes: '',
    purchaseDate: undefined,
    purchasePrice: undefined,
    upc: '',
  });

  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<ProductSearchResult | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);

  // Image Processing Settings
  const [processImage, setProcessImage] = useState<boolean>(true);
  const [backgroundType, setBackgroundType] = useState<string>('minimal');

  const { createItem, error, isLoading, processingStatus, reset } = useCreateItem();
  const { data: productMatches, isLoading: isSearching } = useSearchProducts({
    brandName: form.brandName,
    name: form.name,
    upc: form.upc,
  });

  const shouldShowMatches: boolean =
    form.name.length > 2 && form.brandName.length > 2 && !selectedMatch && !isCreatingNew;

  const handleSubmit = (): void => {
    // Validation
    if (!form.name.trim()) {
      Alert.alert('Required', 'Please enter item name');
      return;
    }
    if (!form.brandName.trim()) {
      Alert.alert('Required', 'Please enter brand name');
      return;
    }

    // CRITICAL: Must select a product or create new
    if (!selectedMatch && !isCreatingNew) {
      Alert.alert('Product Required', 'Please select a matching product or choose "Create New Product" to continue.');
      return;
    }

    // Prepare payload with either prototype or community product
    const payload: any = {
      ...form,
      backgroundType,
      processImage,
    };

    if (selectedMatch) {
      if (selectedMatch.type === 'prototype') {
        payload.prototypeId = selectedMatch.product.id;
      } else {
        payload.communityProductId = selectedMatch.product.id;
      }
    } else if (isCreatingNew) {
      // Create new community product
      payload.createNewCommunityProduct = true;
    }

    createItem(payload, {
      onError: (err: Error) => {
        Alert.alert('Error', err.message || 'Failed to add item');
      },
      onSuccess: () => {
        Alert.alert('Success', 'Item added to your closet!', [
          {
            onPress: () => {
              router.replace('/(tabs)');
            },
            text: 'OK',
          },
        ]);
      },
    });
  };

  const handleSelectMatch = (match: ProductSearchResult): void => {
    setSelectedMatch(match);
    setIsCreatingNew(false);
    const product = match.product;
    setForm(prev => ({
      ...prev,
      brandName: match.type === 'prototype' ? (product as any).brand?.name : (product as any).brandName,
      category: product.category || prev.category,
      name: product.name,
      upc: product.upc || prev.upc,
    }));
  };

  const handleCreateNew = (): void => {
    setSelectedMatch(null);
    setIsCreatingNew(true);
  };

  const handleUnselectProduct = (): void => {
    setSelectedMatch(null);
    setIsCreatingNew(false);
  };

  return (
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
              onPress={() => setForm(prev => ({ ...prev, imageUri: undefined }))}
              className="absolute top-2 right-2 bg-black/70 rounded-full p-2"
              activeOpacity={0.7}
            >
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Professional Photo Processing Toggle */}
        {form.imageUri && (
          <View className="mb-6 bg-white/5 rounded-2xl p-4 border border-white/10">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1 mr-4">
                <View className="flex-row items-center gap-2 mb-1">
                  <Sparkles size={18} color="#ffffff" />
                  <Text className="text-white font-bold text-base">Professional Photo</Text>
                </View>
                <Text className="text-gray-400 text-sm leading-5">
                  Remove background & add studio backdrop for a professional look
                </Text>
              </View>
              <Switch
                value={processImage}
                onValueChange={setProcessImage}
                trackColor={{ false: '#374151', true: '#ffffff' }}
                thumbColor={processImage ? '#000000' : '#9CA3AF'}
                ios_backgroundColor="#374151"
              />
            </View>

            {processImage && (
              <View className="mt-4 pt-4 border-t border-white/10">
                <BackgroundPicker selectedId={backgroundType} onSelect={setBackgroundType} enabled={processImage} />

                <View className="flex-row items-start gap-2 mt-3 bg-white/5 rounded-xl p-3">
                  <Info size={16} color="#9CA3AF" className="mt-0.5" />
                  <Text className="flex-1 text-gray-400 text-xs leading-4">
                    Your photo will be professionally processed with AI to remove the background and add a clean studio
                    backdrop
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Form Fields */}
        <InputField
          label="Item Name"
          value={form.name}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, name: text }))}
          placeholder="e.g., Air Force 1 Low"
          editable={!isLoading}
        />

        <BrandSearchInput
          value={form.brandName}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, brandName: text }))}
          onBrandSelect={(brand: Brand) => setSelectedBrand(brand)}
          placeholder="Brand name"
        />

        <InputField
          label="UPC/Barcode (Optional)"
          value={form.upc}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, upc: text }))}
          placeholder="123456789012"
          keyboardType="numeric"
          editable={!isLoading}
        />

        <InputField
          label="Category (Optional)"
          value={form.category}
          onChangeText={(text: string) => setForm(prev => ({ ...prev, category: text }))}
          placeholder="e.g., Shoes, Shirt, Pants"
          editable={!isLoading}
        />

        {/* Product Selection Required Warning */}
        {!selectedMatch && !isCreatingNew && form.name.length > 2 && form.brandName.length > 2 && (
          <View className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-4 flex-row items-start gap-3">
            <AlertCircle size={20} color="#EAB308" className="mt-0.5" />
            <View className="flex-1">
              <Text className="text-yellow-400 font-semibold mb-1">Product Selection Required</Text>
              <Text className="text-yellow-300 text-sm">
                Select a matching product below or create a new one to continue.
              </Text>
            </View>
          </View>
        )}

        {/* Product Matches */}
        {shouldShowMatches && (
          <View className="mb-4">
            {isSearching ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-gray-400 text-sm mt-2">Searching for matches...</Text>
              </View>
            ) : productMatches && productMatches.length > 0 ? (
              <>
                <Text className="text-white font-semibold mb-3">✨ Matching products found:</Text>
                {productMatches.slice(0, 3).map((match: ProductSearchResult, index: number) => (
                  <ProductMatchCard
                    key={`${match.type}-${match.product.id}-${index}`}
                    match={match}
                    onSelect={() => handleSelectMatch(match)}
                  />
                ))}
                <TouchableOpacity
                  onPress={handleCreateNew}
                  className="mt-3 bg-white/10 border border-white/20 rounded-xl p-4"
                >
                  <Text className="text-white font-semibold text-center">Create New Product</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="bg-white/10 rounded-xl p-4 mb-4">
                <Text className="text-white font-semibold mb-2">No matches found</Text>
                <Text className="text-gray-400 text-sm mb-3">
                  We couldn't find this product in our database. You can create it as a new community product.
                </Text>
                <TouchableOpacity onPress={handleCreateNew} className="bg-white rounded-xl p-3">
                  <Text className="text-black font-semibold text-center">Create New Product</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Selected Match Indicator */}
        {selectedMatch && (
          <View className="bg-green-500/20 border border-green-500 rounded-xl p-4 mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-green-400 font-semibold mb-1">✓ Product Selected</Text>
              <Text className="text-white font-medium">{selectedMatch.product.name}</Text>
              <Text className="text-gray-400 text-sm">
                {selectedMatch.type === 'prototype' ? 'Verified Product' : 'Community Product'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleUnselectProduct} className="p-2">
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Creating New Indicator */}
        {isCreatingNew && (
          <View className="bg-blue-500/20 border border-blue-500 rounded-xl p-4 mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-blue-400 font-semibold mb-1">Creating New Community Product</Text>
              <Text className="text-gray-300 text-sm">This will be added to our database for others to use</Text>
            </View>
            <TouchableOpacity onPress={handleUnselectProduct} className="p-2">
              <X size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Processing Status */}
        {processingStatus === 'processing' && (
          <View className="bg-white/10 rounded-xl p-4 mb-4 flex-row items-center">
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="text-white font-medium">Processing your photo...</Text>
              {processImage && (
                <Text className="text-gray-400 text-xs mt-1">Removing background & adding studio backdrop</Text>
              )}
            </View>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-4">
            <Text className="text-red-400 font-semibold mb-1">Error</Text>
            <Text className="text-white">{error.message}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isLoading || !form.name.trim() || !form.brandName.trim() || (!selectedMatch && !isCreatingNew)}
          className={`w-full py-4 rounded-xl mb-4 ${
            isLoading || !form.name.trim() || !form.brandName.trim() || (!selectedMatch && !isCreatingNew)
              ? 'bg-gray-600'
              : 'bg-white'
          }`}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#000000" style={{ marginRight: 8 }} />
              <Text className="text-black font-semibold text-base">
                {processImage ? 'Processing & adding...' : 'Adding item...'}
              </Text>
            </View>
          ) : (
            <Text className="text-black font-semibold text-base text-center">Add to Closet</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}
