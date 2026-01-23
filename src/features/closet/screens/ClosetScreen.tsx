// app/(tabs)/index.tsx - Closet Page (Updated with hooks)
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserOwnerships, useClosetStats } from '@/src/features/closet/hooks/useCloset';
import { OwnershipWithProduct } from '@/src/features/closet/types/closet.types';
import { Package, ShoppingBag } from 'lucide-react-native';

export default function ClosetScreen() {
  const router = useRouter();
  const authUser = useAppSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);

  // Use custom hooks
  const { data: ownerships, isLoading, error, refetch } = useUserOwnerships(authUser?.id);
  const stats = useClosetStats(authUser?.id);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: OwnershipWithProduct }) => {
    const product = item.prototype || item.communityProduct;
    const brandName = item.prototype ? item.prototype.brand.name : item.communityProduct?.brandName;
    const productName = product?.name || 'Unnamed Item';
    const category = product?.category;

    // Choose best available image
    const imageUrl = item.thumbnailUrl || item.processedImageUrl || item.originalImageUrl;
    const isProcessing = item.processingStatus === 'pending' || item.processingStatus === 'processing';

    return (
      <TouchableOpacity
        className="bg-zinc-900 rounded-2xl overflow-hidden mb-4 mx-4"
        activeOpacity={0.7}
        onPress={() => {
          // Navigate to item detail
          console.log('Tapped item:', item.id);
          // router.push(`/closet/${item.id}`);
        }}
      >
        <View className="flex-row">
          {/* Image Section */}
          <View className="w-32 h-32 bg-zinc-800 items-center justify-center">
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Package size={48} color="#666666" />
            )}
            {isProcessing && (
              <View className="absolute inset-0 bg-black/60 items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white text-xs mt-2">Processing...</Text>
              </View>
            )}
          </View>

          {/* Info Section */}
          <View className="flex-1 p-4 justify-center">
            <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
              {productName}
            </Text>
            <Text className="text-gray-400 text-sm mb-1" numberOfLines={1}>
              {brandName}
            </Text>
            {category && (
              <View className="bg-zinc-800 self-start px-3 py-1 rounded-full mt-2">
                <Text className="text-gray-300 text-xs">{category}</Text>
              </View>
            )}
            {item.verified && (
              <View className="bg-blue-600 self-start px-3 py-1 rounded-full mt-2">
                <Text className="text-white text-xs font-semibold">✓ Verified</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 mt-20">
      <ShoppingBag size={80} color="#333333" />
      <Text className="text-white text-2xl font-bold mt-6 text-center">Your Closet is Empty</Text>
      <Text className="text-gray-400 text-center mt-3 mb-8">Start adding items to build your digital wardrobe</Text>
      <TouchableOpacity
        className="bg-white px-8 py-4 rounded-xl"
        activeOpacity={0.7}
        onPress={() => router.push('/(tabs)/new')}
      >
        <Text className="text-black font-semibold text-base">Add Your First Item</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-white mt-4">Loading your closet...</Text>
        </View>
      </Spotlight>
    );
  }

  if (error) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black items-center justify-center px-8">
          <Text className="text-red-500 text-xl font-bold mb-4">Error Loading Closet</Text>
          <Text className="text-gray-400 text-center mb-6">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </Text>
          <TouchableOpacity className="bg-white px-6 py-3 rounded-xl" activeOpacity={0.7} onPress={() => refetch()}>
            <Text className="text-black font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </Spotlight>
    );
  }

  return (
    <Spotlight intensity={0.2}>
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="pt-12 pb-4 px-5 border-b border-zinc-800">
          <Text className="text-white text-3xl font-extrabold">My Closet</Text>
          <View className="flex-row items-center mt-2 gap-4">
            <Text className="text-gray-400">
              {stats.totalItems} {stats.totalItems === 1 ? 'item' : 'items'}
            </Text>
            {stats.verifiedItems > 0 && <Text className="text-blue-400">{stats.verifiedItems} verified</Text>}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={ownerships}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          ListEmptyComponent={EmptyState}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Spotlight>
  );
}
