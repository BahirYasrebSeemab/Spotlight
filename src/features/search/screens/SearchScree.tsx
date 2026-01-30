// app/(tabs)/search/index.tsx
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useDebounce } from '@/src/shared/hooks/useDebounce';
import { useSearchUsers } from '@/src/features/search/hooks/useSearchUsers';
import { useSearchProducts } from '@/src/features/products/hooks/useSearchProducts';
import { useSearchBrands } from '@/src/features/brands/hooks/useSearchBrands';
import { ProductCard } from '@/src/features/products/components/ProductCard';
import { BrandCard } from '@/src/features/brands/components/BrandCard';
import { Spotlight } from '@/src/shared/components/Spotlight';
import type { Product, ProductCategory } from '@/src/features/products/types/product.types';
import type { Brand } from '@/src/features/brands/types/brand.types';

// Add a minimal User shape and a union for list items
type User = {
  id: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  followersCount?: number;
};

type SearchResult = User | Product | Brand;

type Tab = 'people' | 'products' | 'brands';

const PRODUCT_CATEGORIES: ProductCategory[] = ['All', 'Footwear', 'Apparel', 'Accessories'];

export default function SearchScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('people');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Hooks for each tab
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
    // TODO: Navigate to brand page when implemented
    console.log('Brand pressed:', brand.name);
  };

  // Render functions
  const renderUser = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item.id)}
      className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-800"
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatarUrl }} className="w-14 h-14 rounded-full mr-3" />
      <View className="flex-1">
        <Text className="text-base font-semibold text-black dark:text-white">{item.name || item.username}</Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">@{item.username}</Text>
        {item.bio && (
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1" numberOfLines={1}>
            {item.bio}
          </Text>
        )}
        {item.followersCount > 0 && (
          <Text className="text-xs text-gray-500 dark:text-gray-500 mt-1">{item.followersCount} spotters</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    const isLoading =
      (activeTab === 'people' && isLoadingUsers) ||
      (activeTab === 'products' && isLoadingProducts) ||
      (activeTab === 'brands' && isLoadingBrands);

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      );
    }

    if (!searchQuery) {
      const placeholders = {
        people: { icon: '👥', title: 'Search for people', subtitle: 'Find users by their username or name' },
        products: { icon: '👟', title: 'Search for products', subtitle: 'Find sneakers, apparel, and more' },
        brands: { icon: '🏷️', title: 'Search for brands', subtitle: 'Discover verified brands' },
      };

      const placeholder = placeholders[activeTab];

      return (
        <View className="flex-1 items-center justify-center py-20 px-8">
          <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-4">
            <Text className="text-4xl">{placeholder.icon}</Text>
          </View>
          <Text className="text-xl font-bold text-black dark:text-white mb-2">{placeholder.title}</Text>
          <Text className="text-center text-gray-500 dark:text-gray-400">{placeholder.subtitle}</Text>
        </View>
      );
    }

    const currentData = activeTab === 'people' ? users : activeTab === 'products' ? filteredProducts : brands;

    if (searchQuery && currentData?.length === 0) {
      return (
        <View className="flex-1 items-center justify-center py-20 px-8">
          <Text className="text-lg font-semibold text-black dark:text-white mb-2">Nothing found</Text>
          <Text className="text-center text-gray-500 dark:text-gray-400">Try searching for something else</Text>
        </View>
      );
    }

    return null;
  };

  const getCurrentData = (): SearchResult[] => {
    switch (activeTab) {
      case 'people':
        return (users as User[]) || [];
      case 'products':
        return (filteredProducts as Product[]) || [];
      case 'brands':
        return (brands as Brand[]) || [];
      default:
        return [];
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    switch (activeTab) {
      case 'people':
        return renderUser({ item: item as User });
      case 'products':
        return <ProductCard product={item as Product} onPress={handleProductPress} />;
      case 'brands':
        return <BrandCard brand={item as Brand} onPress={handleBrandPress} />;
      default:
        return null;
    }
  };

  return (
    <Spotlight intensity={0.2}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-black"
      >
        {/* Header */}
        <View className="pb-3 px-4 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
          {/* Search Input */}
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-900 rounded-full px-4 py-3">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-black dark:text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} className="ml-2">
                <X size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Tabs */}
          <View className="flex-row mt-3 space-x-2">
            {(['people', 'products', 'brands'] as Tab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-full ${
                  activeTab === tab ? 'bg-violet-600' : 'bg-gray-100 dark:bg-gray-900'
                }`}
              >
                <Text
                  className={`text-center font-semibold capitalize ${
                    activeTab === tab ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Filters (Products Tab Only) */}
          {activeTab === 'products' && (
            <View className="flex-row mt-3 space-x-2">
              {PRODUCT_CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`px-4 py-1.5 rounded-full ${
                    selectedCategory === category ? 'bg-violet-600' : 'bg-gray-100 dark:bg-gray-900'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      selectedCategory === category ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Results */}
        <FlatList<SearchResult>
          data={getCurrentData()}
          renderItem={renderItem}
          keyExtractor={item => String((item as any).id)}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </Spotlight>
  );
}
