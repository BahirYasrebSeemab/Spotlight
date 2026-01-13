// ========================================
// app/user/[id]/followers.tsx - INVERTED with Privacy Check
// ========================================
import { View, FlatList, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '@/src/features/user/hooks/useUserProfile';
import { useFollowStatus } from '@/src/features/user/hooks/useFollowStatus';
import { useUserFollowers } from '@/src/features/user/hooks/useUserFollowers';
import { FollowerItem } from '@/src/features/user/components/FollowerItem';
import { Lock } from 'lucide-react-native';

export default function FollowersScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppSelector(state => state.auth.user);

  // Fetch user profile first to check if private
  const { data: user, isLoading: userLoading } = useUserProfile(id);

  // Check follow status
  const { data: followStatus, isLoading: followLoading } = useFollowStatus(currentUser?.id, id);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === id;

  // Only fetch followers if: own profile OR account is public OR user is following
  const shouldFetchFollowers = isOwnProfile || !user?.isPrivate || followStatus?.isFollowing;

  const {
    data: followersData,
    isLoading: followersLoading,
    fetchNextPage,
    hasNextPage,
  } = useUserFollowers(id, { enabled: shouldFetchFollowers });

  // Loading state
  if (userLoading || followLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Check if private account and not following (and not own profile)
  if (user?.isPrivate && !followStatus?.isFollowing && !isOwnProfile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black px-8">
        <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-6">
          <Lock size={40} color="#9CA3AF" strokeWidth={1.5} />
        </View>
        <Text className="text-2xl font-bold text-black dark:text-white mb-3 text-center">This Account is Private</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center text-base leading-6">
          Follow this account to see who spots them
        </Text>
      </View>
    );
  }

  const followers = followersData?.pages.flatMap(page => page.followers || page) || [];

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
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20 px-8">
            {followersLoading ? (
              <ActivityIndicator size="large" color="#8B5CF6" />
            ) : (
              <>
                <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-4">
                  <Text className="text-3xl">👥</Text>
                </View>
                <Text className="text-xl font-bold text-black dark:text-white mb-2">No spotters yet</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center">
                  When someone spots this user, they'll appear here
                </Text>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}
