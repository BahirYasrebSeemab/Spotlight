import { View, Text, FlatList, Pressable, ActivityIndicator, Image, Dimensions, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useExplore } from '@/src/features/closet/hooks/useExplore';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { Package, Play } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD = Math.floor(width / 3);

type Tab = 'community' | 'following';

export default function ExploreScreen() {
  const router = useRouter();
  const user = useAppSelector(state => state.auth.user);
  const [activeTab, setActiveTab] = useState<Tab>('community');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useExplore(user?.id);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderCard = ({ item }: { item: any }) => {
    const isMemory = item._type === 'MEMORY';
    const isCommunity = item._type === 'COMMUNITY';
    const isOwnership = item._type === 'OWNERSHIP';
    const isVideo = isMemory && item.mediaType === 'video';

    let imageUrl: string | null = null;

    if (isMemory) {
      imageUrl = item.thumbnailUrl || item.mediaUrl || null;
    } else if (isCommunity) {
      imageUrl = item.thumbnailUrl || item.imageUrl || null;
    } else if (isOwnership) {
      imageUrl =
        item.thumbnailImageUrl ||
        item.processedImageUrl ||
        item.thumbnailUrl ||
        (Array.isArray(item.prototype) ? item.prototype[0] : item.prototype)?.thumbnailUrl ||
        (Array.isArray(item.prototype) ? item.prototype[0] : item.prototype)?.imageUrl ||
        (Array.isArray(item.communityProduct) ? item.communityProduct[0] : item.communityProduct)?.thumbnailUrl ||
        (Array.isArray(item.communityProduct) ? item.communityProduct[0] : item.communityProduct)?.imageUrl ||
        null;
    }

    const handlePress = () => {
      if (isMemory) router.push(`/memory/${item.id}` as any);
      else if (isCommunity)
        router.push({ pathname: '/product/[id]', params: { id: item.id, type: 'COMMUNITY' } } as any);
      else if (isOwnership) router.push(`/ownership/${item.id}` as any);
    };

    return (
      <Pressable
        style={{
          width: CARD,
          height: CARD,
          borderWidth: 0.5,
          borderColor: '#2a2a2a',
        }}
        onPress={handlePress}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={{ width: CARD, height: CARD }} resizeMode="cover" />
        ) : (
          <View
            style={{ width: CARD, height: CARD, backgroundColor: '#141414' }}
            className="items-center justify-center"
          >
            <Package size={28} color="#3a3a3a" strokeWidth={1.5} />
          </View>
        )}

        {isVideo && (
          <View className="absolute top-2 right-2">
            <Play size={14} color="white" fill="white" />
          </View>
        )}
      </Pressable>
    );
  };

  const TabBar = () => (
    <View className="flex-row border-b border-white/10">
      {(['community', 'following'] as Tab[]).map(tab => (
        <Pressable key={tab} onPress={() => setActiveTab(tab)} className="flex-1 py-3 items-center">
          <Text className={`text-sm font-semibold capitalize ${activeTab === tab ? 'text-white' : 'text-gray-500'}`}>
            {tab}
          </Text>
          {activeTab === tab && <View className="absolute bottom-0 left-8 right-8 h-0.5 bg-white rounded-full" />}
        </Pressable>
      ))}
    </View>
  );

  const EmptyCommunity = () => (
    <View className="items-center justify-center pt-20 px-8">
      <Text className="text-white text-xl font-bold text-center mb-2">Nothing here yet</Text>
      <Text className="text-gray-400 text-center">Memories and products will show up here.</Text>
    </View>
  );

  const EmptyFollowing = () => (
    <View className="items-center justify-center pt-20 px-8">
      <Text className="text-white text-xl font-bold text-center mb-2">Follow people first</Text>
      <Text className="text-gray-400 text-center">Items and memories from people you follow will appear here.</Text>
    </View>
  );

  if (isLoading) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Spotlight>
    );
  }

  if (error) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 bg-black items-center justify-center px-8">
          <Text className="text-white text-xl font-bold mb-4">Something went wrong</Text>
          <Pressable className="bg-white px-6 py-3 rounded-xl" onPress={() => refetch()}>
            <Text className="text-black font-semibold">Try Again</Text>
          </Pressable>
        </View>
      </Spotlight>
    );
  }

  const communityData = data?.community ?? [];
  const followingData = data?.following ?? [];
  const activeData = activeTab === 'community' ? communityData : followingData;

  return (
    <Spotlight intensity={0.2}>
      <View className="flex-1 bg-black">
        <View className="pt-16 pb-4 px-4">
          <Text className="text-white text-3xl font-bold">Explore</Text>
        </View>

        <FlatList
          data={activeData}
          keyExtractor={item => `${item._type}-${item.id}`}
          numColumns={3}
          renderItem={renderCard}
          ListHeaderComponent={<TabBar />}
          ListEmptyComponent={activeTab === 'community' ? <EmptyCommunity /> : <EmptyFollowing />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>
    </Spotlight>
  );
}
