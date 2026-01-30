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
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Search, X, CheckCircle, Package } from 'lucide-react-native';
import { useDebounce } from '@/src/shared/hooks/useDebounce';
import { useSearchUsers } from '@/src/features/search/hooks/useSearchUsers';
import { useSearchProducts } from '@/src/features/products/hooks/useSearchProducts';
import { useSearchBrands } from '@/src/features/brands/hooks/useSearchBrands';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { InputField } from '@/src/shared/components/InputField';
import type { Product, ProductCategory } from '@/src/features/products/types/product.types';
import type { Brand } from '@/src/features/brands/types/brand.types';

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
    console.log('Brand pressed:', brand.name);
  };

  // Product Card
  const ProductCard = ({ product }: { product: Product }) => {
    const isVerified = product.type === 'PROTOTYPE';

    return (
      <TouchableOpacity
        onPress={() => handleProductPress(product)}
        className="flex-row items-center p-4 border-b border-gray-800"
        activeOpacity={0.7}
      >
        <View className="relative">
          <Image
            source={{
              uri: product.thumbnailUrl || product.imageUrl || 'https://via.placeholder.com/60',
            }}
            className="w-16 h-16 rounded-lg bg-gray-900"
          />
          <View className="absolute -top-1 -right-1">
            {isVerified ? (
              <CheckCircle size={16} color="#FFF" fill="#FFF" />
            ) : (
              <View className="bg-gray-600 rounded-full p-0.5">
                <Package size={12} color="white" />
              </View>
            )}
          </View>
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="text-sm text-gray-400" numberOfLines={1}>
            {product.brandName}
          </Text>

          <View className="flex-row items-center mt-1">
            {product.category && <Text className="text-xs text-gray-500">{product.category}</Text>}
            {product.retailPrice && <Text className="text-xs text-gray-500 ml-2">${product.retailPrice}</Text>}
          </View>

          {product.ownershipCount > 0 && (
            <Text className="text-xs text-gray-500 mt-1">
              {product.ownershipCount} owner{product.ownershipCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Brand Card
  const BrandCard = ({ brand }: { brand: Brand }) => {
    return (
      <TouchableOpacity
        onPress={() => handleBrandPress(brand)}
        className="flex-row items-center p-4 border-b border-gray-800"
        activeOpacity={0.7}
      >
        <View className="relative">
          <Image
            source={{
              uri:
                brand.logoUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=56&background=1f1f1f&color=fff`,
            }}
            className="w-14 h-14 rounded-full bg-gray-900"
          />
          {brand.verified && (
            <View className="absolute -bottom-1 -right-1">
              <CheckCircle size={14} color="#FFF" fill="#FFF" />
            </View>
          )}
        </View>

        <View className="flex-1 ml-3">
          <Text className="text-base font-semibold text-white">{brand.name}</Text>
          {brand.description && (
            <Text className="text-sm text-gray-400 mt-1" numberOfLines={2}>
              {brand.description}
            </Text>
          )}
          <Text className="text-xs text-gray-500 uppercase mt-1">{brand.type}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // User Card
  const renderUser = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => handleUserPress(item.id)}
      className="flex-row items-center p-4 border-b border-gray-800"
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.avatarUrl }} className="w-14 h-14 rounded-full mr-3" />
      <View className="flex-1">
        <Text className="text-base font-semibold text-white">{item.name || item.username}</Text>
        <Text className="text-sm text-gray-400">@{item.username}</Text>
        {item.bio && (
          <Text className="text-sm text-gray-400 mt-1" numberOfLines={1}>
            {item.bio}
          </Text>
        )}
        {item.followersCount > 0 && <Text className="text-xs text-gray-500 mt-1">{item.followersCount} spotters</Text>}
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
          <ActivityIndicator size="large" color="#FFF" />
        </View>
      );
    }

    if (!searchQuery) {
      const placeholders = {
        people: { title: 'Search for people', subtitle: 'Find users by their username or name' },
        products: { title: 'Search for products', subtitle: 'Find sneakers, apparel, and more' },
        brands: { title: 'Search for brands', subtitle: 'Discover verified brands' },
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
        return (users || []).map(user => ({ type: 'people' as const, data: user }));
      case 'products':
        return (filteredProducts || []).map(product => ({ type: 'products' as const, data: product }));
      case 'brands':
        return (brands || []).map(brand => ({ type: 'brands' as const, data: brand }));
      default:
        return [];
    }
  };

  const renderItem = ({ item }: { item: SearchResult }) => {
    switch (item.type) {
      case 'people':
        return renderUser({ item: item.data });
      case 'products':
        return <ProductCard product={item.data} />;
      case 'brands':
        return <BrandCard brand={item.data} />;
      default:
        return null;
    }
  };

  return (
    <Spotlight intensity={0.25}>
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
                      className={`text-sm font-medium ${
                        selectedCategory === category ? 'text-black' : 'text-gray-400'
                      }`}
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
    </Spotlight>
  );
}
