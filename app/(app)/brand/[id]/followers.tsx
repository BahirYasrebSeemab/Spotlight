import { View, FlatList, ActivityIndicator, Text, Pressable, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useBrandFollowers } from '@/src/features/brands/hooks/useBrandFollowers';
import { Users } from 'lucide-react-native';

export default function BrandFollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: followersData, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useBrandFollowers(id);

  const followers = followersData?.pages.flatMap(page => page) || [];

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <FlatList
        data={followers}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/user/${item.user.id}` as any)}
            className="flex-row items-center p-4 border-b border-white/10"
          >
            <Image source={{ uri: item.user.avatarUrl }} className="w-12 h-12 rounded-full bg-white/10" />
            <View className="ml-3 flex-1">
              <Text className="text-white font-semibold text-base">{item.user.name || item.user.username}</Text>
              <Text className="text-gray-400 text-sm">@{item.user.username}</Text>
            </View>
          </Pressable>
        )}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20 px-8">
            <View className="w-24 h-24 rounded-full bg-white/5 items-center justify-center mb-6">
              <Users size={40} color="#6B7280" strokeWidth={1.5} />
            </View>
            <Text className="text-2xl font-bold text-white mb-3 text-center">No Followers Yet</Text>
            <Text className="text-gray-400 text-center text-base leading-6">
              When someone follows this brand, they'll appear here
            </Text>
          </View>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
