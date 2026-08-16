import { useState, useLayoutEffect } from 'react';
import { Share, MoreVertical } from 'lucide-react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { View, FlatList, ActivityIndicator, Text, RefreshControl, Pressable, Alert } from 'react-native';

import { useAppSelector } from '@/src/shared/hooks/redux';
import { BrandTabBar } from '@/src/features/brands/components/BrandTabBar';
import { BrandIdentity } from '@/src/features/brands/components/BrandIdentity';
import { BrandProductGrid } from '@/src/features/brands/components/BrandProductGrid';
import { EmptyBrandContent } from '@/src/features/brands/components/EmptyBrandContent';
// Hooks
import { useFollowBrand } from '@/src/features/brands/hooks/useFollowBrand';
import { useBrandProfile } from '@/src/features/brands/hooks/useBrandProfile';
import { useBrandProducts } from '@/src/features/brands/hooks/useBrandProducts';

export default function BrandProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppSelector(state => state.auth.user);
  const router = useRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'products' | 'community' | 'about'>('products');

  // Fetch brand profile
  const { data: brand, isLoading: brandLoading, refetch: refetchBrand } = useBrandProfile(id, currentUser?.id);

  // Fetch brand products
  const {
    data: productsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useBrandProducts(id);

  // Follow/unfollow mutation
  const { follow, isLoading: followLoading, unfollow } = useFollowBrand();

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Flatten products from infinite query
  const products = productsData?.pages.flatMap(page => page) || [];

  // Set header
  useLayoutEffect(() => {
    if (brand?.name) {
      navigation.setOptions({
        headerRight: () => (
          <View className="flex-row items-center gap-2">
            <Pressable onPress={handleShare} className="p-2">
              <Share size={22} color="white" />
            </Pressable>
            <Pressable onPress={handleMore} className="p-2">
              <MoreVertical size={22} color="white" />
            </Pressable>
          </View>
        ),
        title: brand.name,
      });
    }
  }, [brand]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchBrand(), refetchProducts()]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle follow/unfollow toggle
  const handleFollowToggle = () => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'Please sign in to follow brands');
      return;
    }

    if (!brand) return;

    if (brand.isFollowing) {
      unfollow({ brandId: id, userId: currentUser.id });
    } else {
      follow({ brandId: id, userId: currentUser.id });
    }
  };

  const handleShare = () => {
    console.log('Share brand:', brand?.name);
  };

  const handleMore = () => {
    Alert.alert('Options', '', [
      { onPress: () => console.log('Report'), style: 'destructive', text: 'Report Brand' },
      { onPress: () => console.log('Copy'), text: 'Copy Brand Link' },
      { style: 'cancel', text: 'Cancel' },
    ]);
  };

  // Loading state
  if (brandLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // Not found state
  if (!brand) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Text className="text-xl font-bold text-white mb-2">Brand not found</Text>
        <Text className="text-gray-400 text-center">This brand doesn't exist or has been removed</Text>
      </View>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        if (productsLoading) {
          return (
            <View className="py-20">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          );
        }
        if (products.length === 0) {
          return <EmptyBrandContent activeTab="products" />;
        }
        return <BrandProductGrid products={products} columns={3} />;

      case 'community':
        return <EmptyBrandContent activeTab="community" />;

      case 'about':
        return (
          <View className="p-6">
            {brand.description && (
              <View className="mb-6">
                <Text className="text-white font-bold text-lg mb-2">About</Text>
                <Text className="text-gray-300 leading-6">{brand.description}</Text>
              </View>
            )}

            {brand.verified && (
              <View className="mb-6">
                <Text className="text-white font-bold text-lg mb-2">Verification</Text>
                <Text className="text-gray-300 leading-6">
                  This brand is verified and officially registered on the platform.
                </Text>
                {brand.approvedAt && (
                  <Text className="text-gray-400 text-sm mt-2">
                    Verified on {new Date(brand.approvedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}

            <View className="mb-6">
              <Text className="text-white font-bold text-lg mb-2">Brand Type</Text>
              <Text className="text-gray-300 leading-6">{brand.type}</Text>
            </View>

            {brand.website && (
              <View className="mb-6">
                <Text className="text-white font-bold text-lg mb-2">Website</Text>
                <Text className="text-blue-400">{brand.website}</Text>
              </View>
            )}

            {brand.instagram && (
              <View className="mb-6">
                <Text className="text-white font-bold text-lg mb-2">Instagram</Text>
                <Text className="text-blue-400">@{brand.instagram}</Text>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={[]}
        keyExtractor={(_, index) => `placeholder-${index}`}
        renderItem={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={['#ffffff']} />
        }
        ListHeaderComponent={() => (
          <BrandIdentity
            brand={brand}
            loading={false}
            isFollowing={brand.isFollowing || false}
            onFollowToggle={handleFollowToggle}
            onLogoPress={() => router.push(`/brand/${id}/logo` as any)}
            onFollowersPress={() => router.push(`/brand/${id}/followers` as any)}
            followLoading={followLoading}
          />
        )}
        ListFooterComponent={() => (
          <View>
            <BrandTabBar activeTab={activeTab} onTabChange={setActiveTab} />
            <View className="min-h-screen">{renderTabContent()}</View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && activeTab === 'products') {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
