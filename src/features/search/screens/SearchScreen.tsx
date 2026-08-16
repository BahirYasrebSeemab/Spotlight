// app/(tabs)/search/index.tsx
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import type { Brand } from '@/src/features/brands/types/brand.types';
import type { Product, ProductCategory } from '@/src/features/products/types/product.types';

import { useDebounce } from '@/src/shared/hooks/useDebounce';
import { InputField } from '@/src/shared/components/InputField';
import { UserCard } from '@/src/features/user/components/UserCard';
import { BrandCard } from '@/src/features/brands/components/BrandCard';
import { useSearchUsers } from '@/src/features/search/hooks/useSearchUsers';
import { ProductCard } from '@/src/features/products/components/ProductCard';
import { useSearchBrands } from '@/src/features/brands/hooks/useSearchBrands';
import { useSearchProducts } from '@/src/features/products/hooks/useSearchProducts';

type Tab = 'people' | 'products' | 'brands';

type SearchResult =
  | { type: 'people'; data: { id: any; username: any; name: any; avatarUrl: any; bio: any; followersCount: any } }
  | { type: 'products'; data: Product }
  | { type: 'brands'; data: Brand };

const PRODUCT_CATEGORIES: ProductCategory[] = ['All', 'Footwear', 'Apparel', 'Accessories'];

export default function SearchScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Hooks
  const { data: users, isLoading: isLoadingUsers } = useSearchUsers(debouncedQuery);
  const { data: products, isLoading: isLoadingProducts } = useSearchProducts(debouncedQuery);
  const { data: brands, isLoading: isLoadingBrands } = useSearchBrands(debouncedQuery);

  // Filter products by category
  const filteredProducts =
    selectedCategory === 'All' ? products : products?.filter(p => p.category === selectedCategory);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleUserPress = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}?type=${product.type}`);
  };

  const handleBrandPress = (brand: Brand) => {
    router.push(`/brand/${brand.id}`);
  };

  const renderEmpty = () => {
    const isLoading =
      (activeTab === 'people' && isLoadingUsers) ||
      (activeTab === 'products' && isLoadingProducts) ||
      (activeTab === 'brands' && isLoadingBrands);

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      );
    }

    if (!searchQuery) {
      const placeholders = {
        brands: { subtitle: 'Discover verified brands', title: 'Search for brands' },
        people: { subtitle: 'Find users by their username or name', title: 'Search for people' },
        products: { subtitle: 'Find sneakers, apparel, and more', title: 'Search for products' },
      };

      const placeholder = placeholders[activeTab];

      return (
        <View className="flex-1 items-center justify-center py-20 px-8">
          <View className="w-20 h-20 rounded-full bg-gray-900 items-center justify-center mb-4">
            <Search size={32} color="#888" />
          </View>
          <Text className="text-xl font-bold text-white mb-2">{placeholder.title}</Text>
          <Text className="text-center text-gray-400">{placeholder.subtitle}</Text>
        </View>
      );
    }

    const currentData = activeTab === 'people' ? users : activeTab === 'products' ? filteredProducts : brands;

    if (searchQuery && currentData?.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-8">
          <Text className="text-lg font-semibold text-white mb-2">Nothing found</Text>
          <Text className="text-center text-gray-400">Try searching for something else</Text>
        </View>
      );
    }

    return null;
  };

  const getCurrentData = (): SearchResult[] => {
    switch (activeTab) {
      case 'people':
        return (users || []).map(user => ({ data: user, type: 'people' as const }));
      case 'products':
        return (filteredProducts || []).map(product => ({ data: product, type: 'products' as const }));
      case 'brands':
        return (brands || []).map(brand => ({ data: brand, type: 'brands' as const }));
      default:
        return [];
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    switch (item.type) {
      case 'people':
        return <UserCard user={item.data} />;
      case 'products':
        return <ProductCard product={item.data} onPress={handleProductPress} />;
      case 'brands':
        return <BrandCard brand={item.data} onPress={handleBrandPress} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black">
      {/* Header */}
      <View className="pb-4 px-4 bg-black border-b border-gray-800">
        {/* Search Input */}
        <View className="pt-3">
          <InputField
            placeholder={`Search ${activeTab}...`}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-2">
          {(['people', 'products', 'brands'] as Tab[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl ${activeTab === tab ? 'bg-white' : 'bg-gray-900'}`}
            >
              <Text
                className={`text-center text-sm font-semibold capitalize ${
                  activeTab === tab ? 'text-black' : 'text-gray-400'
                }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Filters (Scrollable) */}
        {activeTab === 'products' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <View className="flex-row gap-2">
              {PRODUCT_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl ${selectedCategory === category ? 'bg-white' : 'bg-gray-900'}`}
                >
                  <Text
                    className={`text-sm font-medium ${selectedCategory === category ? 'text-black' : 'text-gray-400'}`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={getCurrentData()}
        renderItem={renderItem}
        keyExtractor={item => item.data.id}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      />
    </KeyboardAvoidingView>
  );
}
