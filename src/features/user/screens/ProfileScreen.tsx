// ========================================
// app/(tabs)/profile/index.tsx - FIXED Own Profile
// ========================================
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { useUserProfile } from '@/src/features/user/hooks/useUserProfile';
import { useUserPosts } from '@/src/features/user/hooks/useUserPosts';

export default function ProfileScreen() {
  // Get auth user from Redux (just ID)
  const authUser = useAppSelector(state => state.auth.user);
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch full profile data with React Query
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(authUser?.id);

  // Fetch user posts
  const {
    data: postsData,
    isLoading: postsLoading,
    refetch: refetchPosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserPosts(authUser?.id);

  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/(tabs)/profile/settings')} className="p-2">
          <Settings size={22} color={'white'} />
        </Pressable>
      ),
    });
  }, [router]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchProfile(), refetchPosts()]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (profileLoading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Flatten posts from infinite query
  const posts = postsData?.pages.flatMap(page => page) || [];

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photos') return post.mediaUrl && !post.mediaUrl.includes('.mp4');
    if (activeTab === 'videos') return post.mediaUrl && post.mediaUrl.includes('.mp4');
    return true;
  });

  // Map posts to grid format
  const gridPosts = filteredPosts.map((post: any) => ({
    id: post.id,
    imageUrl: post.mediaUrl || '',
    type: post.mediaUrl?.includes('.mp4') ? ('video' as const) : ('photo' as const),
  }));

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
            user={profile}
            loading={false}
            isOwnProfile={true}
            onEditProfile={() => router.push('/(tabs)/profile/edit-profile')}
            onAvatarPress={() => {
              console.log('Avatar pressed');
            }}
            onFollowersPress={() => router.push(`/user/${profile.id}/followers`)}
            onFollowingPress={() => router.push(`/user/${profile.id}/following`)}
          />
        )}
        ListFooterComponent={() => (
          <View>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={true} />
            <View className="min-h-screen">
              {postsLoading ? (
                <View className="py-20">
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
              ) : gridPosts.length > 0 ? (
                <ProfileContentGrid
                  posts={gridPosts}
                  onPostPress={postId => router.push(`/post/${postId}`)}
                  columns={3}
                />
              ) : (
                <EmptyProfileContent isOwnProfile={true} activeTab={activeTab} />
              )}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
