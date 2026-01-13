// app/user/[id]/index.tsx - With Privacy Logic
import { View, FlatList, ActivityIndicator, Text, RefreshControl, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useState, useLayoutEffect } from 'react';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { Share, MoreVertical, Lock } from 'lucide-react-native';

// Import ENHANCED hooks
import { useUserProfile } from '@/src/features/user/hooks/useUserProfile';
import { useUserPosts } from '@/src/features/user/hooks/useUserPosts';
import { useFollowStatus } from '@/src/features/user/hooks/useFollowStatus';
import { useFollowUser } from '@/src/features/user/hooks/useFollowUser';
import { useFollowRequests } from '@/src/features/user/hooks/useFollowRequests';
import { useFollowRequestStatus } from '@/src/features/user/hooks/useFollowRequestStatus';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppSelector(state => state.auth.user);
  const router = useRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch user profile
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useUserProfile(id);

  // Check follow status
  const { data: followStatus, refetch: refetchFollowStatus } = useFollowStatus(currentUser?.id, id);

  // Check follow request status
  const { data: requestStatus, refetch: refetchRequestStatus } = useFollowRequestStatus(currentUser?.id, id);

  const isOwnProfile = currentUser?.id === id;

  // Only fetch posts if: own profile OR account is public OR user is following
  const shouldFetchPosts = isOwnProfile || !user?.isPrivate || followStatus?.isFollowing;

  // // Fetch user posts (conditionally enabled)
  // const {
  //   data: postsData,
  //   isLoading: postsLoading,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  //   refetch: refetchPosts,
  // } = useUserPosts(id, { enabled: shouldFetchPosts });

  // Follow/unfollow mutation with optimistic updates
  const { follow, unfollow, isLoading: followLoading, error: followError } = useFollowUser();

  // Follow request mutations with optimistic updates
  const { send, cancel, isSending, isCanceling, error: requestError } = useFollowRequests();

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Flatten posts from infinite query
  // const posts = postsData?.pages.flatMap(page => page) || [];

  // Set header
  useLayoutEffect(() => {
    if (user?.username) {
      navigation.setOptions({
        title: `@${user.username}`,
        headerRight: () => (
          <View className="flex-row items-center gap-2">
            <Pressable onPress={handleShare} className="p-2">
              <Share size={22} color="white" />
            </Pressable>
            {!isOwnProfile && (
              <Pressable onPress={handleMore} className="p-2">
                <MoreVertical size={22} color="white" />
              </Pressable>
            )}
          </View>
        ),
      });
    }
  }, [user, isOwnProfile]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshPromises = [refetchUser(), refetchFollowStatus(), refetchRequestStatus()];
      // if (shouldFetchPosts) {
      //   refreshPromises.push(refetchPosts());
      // }
      await Promise.all(refreshPromises);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle follow/unfollow toggle
  const handleFollowToggle = () => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'Please sign in to follow users');
      return;
    }

    // If already following, unfollow
    if (followStatus?.isFollowing) {
      unfollow({ currentUserId: currentUser.id, targetUserId: id });
    } else {
      // Follow or send request (handled by followUserSmart)
      follow({ currentUserId: currentUser.id, targetUserId: id });
    }
  };

  // Handle cancel follow request
  const handleCancelRequest = () => {
    if (!currentUser) return;
    cancel({ requesterId: currentUser.id, requestedId: id });
  };

  // Show error if mutations fail
  if (followError) {
    console.error('Follow error:', followError);
  }
  if (requestError) {
    console.error('Follow request error:', requestError);
  }

  const handleShare = () => {
    console.log('Share profile:', user?.username);
  };

  const handleMore = () => {
    Alert.alert('Options', '', [
      { text: 'Report User', onPress: () => console.log('Report'), style: 'destructive' },
      { text: 'Block User', onPress: () => console.log('Block'), style: 'destructive' },
      { text: 'Copy Profile Link', onPress: () => console.log('Copy') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Loading state
  if (userLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Not found state
  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black px-8">
        <Text className="text-xl font-bold text-black dark:text-white mb-2">User not found</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center">
          This user doesn't exist or has been removed
        </Text>
      </View>
    );
  }

  // Redirect if viewing own profile
  if (isOwnProfile) {
    router.replace('/(tabs)/profile');
    return null;
  }

  // Check if private and not following - show private account message
  const isPrivateAndNotFollowing = user.isPrivate && !followStatus?.isFollowing && !isOwnProfile;

  // // Filter posts based on active tab
  // const filteredPosts = posts.filter((post: any) => {
  //   if (activeTab === 'all') return true;
  //   if (activeTab === 'photos') return post.mediaUrl && !post.mediaUrl.includes('.mp4');
  //   if (activeTab === 'videos') return post.mediaUrl && post.mediaUrl.includes('.mp4');
  //   return true;
  // });

  // // Map to grid format
  // const gridPosts = filteredPosts.map((post: any) => ({
  //   id: post.id,
  //   imageUrl: post.mediaUrl || '',
  //   type: post.mediaUrl?.includes('.mp4') ? ('video' as const) : ('photo' as const),
  // }));

  // Private account content view
  const renderPrivateContent = () => (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-6">
        <Lock size={40} color="#9CA3AF" strokeWidth={1.5} />
      </View>
      <Text className="text-2xl font-bold text-black dark:text-white mb-3 text-center">This Account is Private</Text>
      <Text className="text-gray-500 dark:text-gray-400 text-center text-base leading-6">
        Follow this account to see their posts
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        inverted
        data={[]}
        keyExtractor={(_, index) => `placeholder-${index}`}
        renderItem={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" colors={['#8B5CF6']} />
        }
        ListHeaderComponent={() => (
          <ProfileIdentity
            user={user}
            loading={false}
            isOwnProfile={false}
            isFollowing={followStatus?.isFollowing}
            followRequestStatus={requestStatus?.status || null}
            onFollowToggle={handleFollowToggle}
            onCancelRequest={handleCancelRequest}
            onAvatarPress={() => router.push(`/user/${id}/avatar`)}
            onFollowersPress={isPrivateAndNotFollowing ? undefined : () => router.push(`/user/${user.id}/followers`)}
            onFollowingPress={isPrivateAndNotFollowing ? undefined : () => router.push(`/user/${user.id}/following`)}
            followLoading={followLoading || isSending || isCanceling}
          />
        )}
        ListFooterComponent={() => (
          <View>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={false} />
            <View className="min-h-screen">
              {isPrivateAndNotFollowing ? (
                renderPrivateContent()
              // ) : postsLoading ? (
              //   <View className="py-20">
              //     <ActivityIndicator size="large" color="#8B5CF6" />
              //   </View>
              // ) : gridPosts.length > 0 ? (
              //   <ProfileContentGrid
              //     posts={gridPosts}
              //     onPostPress={postId => router.push(`/post/${postId}`)}
              //     columns={3}
              //   />
              ) : (
                <EmptyProfileContent isOwnProfile={false} activeTab={activeTab} />
              )}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => {
          // if (hasNextPage && !isFetchingNextPage && !isPrivateAndNotFollowing) {
          //   fetchNextPage();
          // }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
