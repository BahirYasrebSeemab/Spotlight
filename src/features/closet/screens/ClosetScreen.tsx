import { View, Text, FlatList, Pressable, ActivityIndicator, Image, RefreshControl, Dimensions } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserOwnerships, useClosetStats } from '@/src/features/closet/hooks/useCloset';
import { OwnershipWithProduct } from '@/src/features/closet/types/closet.types';
import { Package, ShoppingBag, CheckCircle, Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with 16px padding on sides + 16pxgap

export default function ClosetScreen() {
  const router = useRouter();
  const authUser = useAppSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);

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

    // Fix: correct field priority — thumbnailImageUrl is what the edge function saves
    // Fall back to product's own image when useOfficialImage is true or no custom image exists
const imageUrl =
  [item.thumbnailImageUrl, item.processedImageUrl, product?.thumbnailUrl, product?.imageUrl].find(
    url => !!url && url.length > 0,
  ) ?? null;

    const isProcessing = item.processingStatus === 'pending' || item.processingStatus === 'processing';
    return (
      <Pressable
        style={{ width: CARD_WIDTH }}
        className="mb-4"
        onPress={() => {
          router.push(`/ownership/${item.id}` as any);
        }}
      >
        {/* Image Container */}
        <View className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
          <View style={{ height: CARD_WIDTH }} className="bg-white/5 items-center justify-center">
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={{ width: CARD_WIDTH, height: CARD_WIDTH }} resizeMode="cover" />
            ) : (
              <Package size={48} color="#6B7280" strokeWidth={1.5} />
            )}

            {/* Processing Overlay */}
            {isProcessing && (
              <View className="absolute inset-0 bg-black/70 items-center justify-center">
                <ActivityIndicator size="small" color="#ffffff" />
                <Text className="text-white text-xs mt-2 font-medium">Processing...</Text>
              </View>
            )}

            {/* Verified Badge */}
            {item.verified && (
              <View className="absolute top-2 right-2 bg-black/80 rounded-full p-1.5">
                <CheckCircle size={16} color="#10B981" fill="#10B981" />
              </View>
            )}
          </View>

          {/* Info Section */}
          <View className="p-3">
            <Text className="text-white font-bold text-sm" numberOfLines={1}>
              {productName}
            </Text>
            <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>
              {brandName}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const EmptyState = () => (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <View className="w-24 h-24 rounded-full bg-white/5 items-center justify-center mb-6">
        <ShoppingBag size={48} color="#6B7280" strokeWidth={1.5} />
      </View>
      <Text className="text-white text-2xl font-bold text-center mb-3">Your Closet is Empty</Text>
      <Text className="text-gray-400 text-center mb-8 leading-6">
        Start adding items to build your digital wardrobe
      </Text>
      <Pressable className="bg-white px-8 py-4 rounded-xl" onPress={() => router.push('/(tabs)/new')}>
        <Text className="text-black font-bold text-base">Add Your First Item</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
          <Text className="text-gray-400 mt-4">Loading your closet...</Text>
        </View>
      </Spotlight>
    );
  }

  if (error) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black items-center justify-center px-8">
          <Text className="text-white text-xl font-bold mb-4">Error Loading Closet</Text>
          <Text className="text-gray-400 text-center mb-6">
            {error instanceof Error ? error.message : 'Something went wrong'}
          </Text>
          <Pressable className="bg-white px-6 py-3 rounded-xl" onPress={() => refetch()}>
            <Text className="text-black font-semibold">Try Again</Text>
          </Pressable>
        </View>
      </Spotlight>
    );
  }

  return (
    <Spotlight intensity={0.2}>
      <View className="flex-1 bg-black">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-16 pb-6 px-4 border-b border-white/10">
          <View>
            <Text className="text-white text-3xl font-bold mb-2">My Closet</Text>
            <View className="flex-row items-center gap-4">
              <Text className="text-gray-400 text-sm">
                {stats.totalItems} {stats.totalItems === 1 ? 'item' : 'items'}
              </Text>
              {stats.verifiedItems > 0 && (
                <View className="flex-row items-center gap-1">
                  <CheckCircle size={14} color="#10B981" fill="#10B981" />
                  <Text className="text-green-400 text-sm">{stats.verifiedItems} verified</Text>
                </View>
              )}
            </View>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/new/community-product')} className="p-2">
            <Plus size={25} color={'white'} />
          </Pressable>
        </View>

        {/* Grid */}
        <FlatList
          data={ownerships}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={{ paddingHorizontal: 16, gap: 16 }}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
          ListEmptyComponent={EmptyState}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </Spotlight>
  );
}
