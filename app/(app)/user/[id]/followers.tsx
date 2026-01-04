// app/user/[id]/followers.tsx - FIXED Spotters List
import { View, FlatList, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUserFollowers } from '@/src/features/user/hooks/useUserFollowers';
import { useFollowStatus } from '@/src/features/user/hooks/useFollowStatus';
import { useFollowUser } from '@/src/features/user/hooks/useFollowUser';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function FollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAppSelector(state => state.user);
  const { follow, unfollow } = useFollowUser();

  const { data: followersData, isLoading, fetchNextPage, hasNextPage } = useUserFollowers(id);

  const followers = followersData?.pages.flatMap(page => page) || [];

  interface FollowerUser {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
  }

  const FollowerItem = ({ item }: { item: FollowerUser }) => {
    const { data: followStatus } = useFollowStatus(currentUser?.id, item.id);
    const isOwnProfile = currentUser?.id === item.id;

    const handleFollowToggle = () => {
      if (!currentUser) return;

      if (followStatus?.isFollowing) {
        unfollow({ currentUserId: currentUser.id, targetUserId: item.id });
      } else {
        follow({ currentUserId: currentUser.id, targetUserId: item.id });
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/user/${item.id}`)}
        className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800"
      >
        <View className="flex-row items-center flex-1">
          <Image source={{ uri: item.avatarUrl }} className="w-12 h-12 rounded-full mr-3" />
          <View className="flex-1">
            <Text className="font-semibold text-black dark:text-white">{item.name || item.username}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">@{item.username}</Text>
          </View>
        </View>

        {!isOwnProfile && (
          <TouchableOpacity
            onPress={handleFollowToggle}
            className={`px-4 py-2 rounded-full ${
              followStatus?.isFollowing ? 'bg-gray-200 dark:bg-gray-800' : 'bg-purple-600'
            }`}
          >
            <Text
              className={`font-semibold text-sm ${
                followStatus?.isFollowing ? 'text-black dark:text-white' : 'text-white'
              }`}
            >
              {followStatus?.isFollowing ? 'Spotting' : 'Spot'}
            </Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        data={followers}
        renderItem={({ item }) => <FollowerItem item={item} />}
        keyExtractor={item => item.id}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 dark:text-gray-400">No spotters yet</Text>
          </View>
        )}
      />
    </View>
  );
}
