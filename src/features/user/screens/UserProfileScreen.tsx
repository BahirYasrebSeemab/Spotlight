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
import { Spotlight } from '@/src/shared/components/Spotlight';

// Import ENHANCED hooks
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { useUserMemories } from '@/src/features/user/hooks/useUserMemories';
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

  // Only fetch memories if: own profile OR account is public OR user is following
  const shouldFetchMemories = isOwnProfile || !user?.isPrivate || followStatus?.isFollowing;

  // // Fetch user memories (conditionally enabled)
  // const {
  //   data: memoriesData,
  //   isLoading: memoriesLoading,
  //   fetchNextPage,
  //   hasNextPage,
  //   isFetchingNextPage,
  //   refetch: refetchMemories,
  // } = useUserMemories(id, { enabled: shouldFetchMemories });

  // Follow/unfollow mutation with optimistic updates
  const { follow, unfollow, isLoading: followLoading, error: followError } = useFollowUser();

  // Follow request mutations with optimistic updates
  const { send, cancel, isSending, isCanceling, error: requestError } = useFollowRequests();

  // Refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Flatten memories from infinite query
  // const memories = memoriesData?.pages.flatMap(page => page) || [];

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
      // if (shouldFetchMemories) {
      //   refreshPromises.push(refetchMemories());
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
      <Spotlight intensity={0.2}>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Spotlight>
    );
  }

  // Not found state
  if (!user) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 items-center justify-center bg-black px-8">
          <Text className="text-xl font-bold text-white mb-2">User not found</Text>
          <Text className="text-gray-400 text-center">This user doesn't exist or has been removed</Text>
        </View>
      </Spotlight>
    );
  }

  // Redirect if viewing own profile
  if (isOwnProfile) {
    router.replace('/(tabs)/profile');
    return null;
  }

  // Check if private and not following - show private account message
  const isPrivateAndNotFollowing = user.isPrivate && !followStatus?.isFollowing && !isOwnProfile;

  // // Filter memories based on active tab
  // const filteredMemories = memories.filter((memory: any) => {
  //   if (activeTab === 'all') return true;
  //   if (activeTab === 'photos') return post.mediaUrl && !post.mediaUrl.includes('.mp4');
  //   if (activeTab === 'videos') return post.mediaUrl && post.mediaUrl.includes('.mp4');
  //   return true;
  // });

  // // Map to grid format
  // const gridMemories = filteredMemories.map((memory: any) => ({
  //   id: memory.id,
  //   imageUrl: memory.mediaUrl || '',
  //   type: memory.mediaUrl?.includes('.mp4') ? ('video' as const) : ('photo' as const),
  // }));

  // Private account content view
  const renderPrivateContent = () => (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center mb-6">
        <Lock size={40} color="#ffffff" strokeWidth={1.5} />
      </View>
      <Text className="text-2xl font-bold text-white mb-3 text-center">This Account is Private</Text>
      <Text className="text-gray-400 text-center text-base leading-6">Follow this account to see their Memories</Text>
    </View>
  );

  return (
    <Spotlight intensity={0.2}>
      <View className="flex-1 bg-black">
        <FlatList
          inverted
          data={[]}
          keyExtractor={(_, index) => `placeholder-${index}`}
          renderItem={() => null}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={['#ffffff']} />
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
                ) : (
                  // ) : memoriesLoading ? (
                  //   <View className="py-20">
                  //     <ActivityIndicator size="large" color="#8B5CF6" />
                  //   </View>
                  // ) : gridMemories.length > 0 ? (
                  //   <ProfileContentGrid
                  //     memories={gridMemories}
                  //     onPostPress={postId => router.push(`/post/${postId}`)}
                  //     columns={3}
                  //   />
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
    </Spotlight>
  );
}
