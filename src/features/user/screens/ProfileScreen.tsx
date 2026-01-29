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
import { useUserMemories } from '@/src/features/user/hooks/useUserMemories';
import { Spotlight } from '@/src/shared/components/Spotlight';

export default function ProfileScreen() {
  // Get auth user from Redux (just ID)
  const authUser = useAppSelector(state => state.auth.user);
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch full profile data with React Query
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(authUser?.id);

  // Fetch user memories with React Query
  const {
    data: memoriesData,
    isLoading: memoriesLoading,
    refetch: refetchMemories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserMemories(authUser?.id);

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
      await Promise.all([refetchProfile(), refetchMemories()]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Loading state
  if (profileLoading || !profile) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Spotlight>
    );
  }

  // Flatten memories from infinite query
  const memories = memoriesData?.pages.flatMap(page => page) || [];

  // Filter memories based on active tab
  const filteredMemories = memories.filter((memory: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photos') return memory.mediaUrl && !memory.mediaUrl.includes('.mp4');
    if (activeTab === 'videos') return memory.mediaUrl && memory.mediaUrl.includes('.mp4');
    return true;
  });

  // Map memories to grid format
  const gridMemories = filteredMemories.map((memory: any) => ({
    id: memory.id,
    imageUrl: memory.mediaUrl || '',
    type: memory.mediaUrl?.includes('.mp4') ? ('video' as const) : ('photo' as const),
  }));

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
              {memoriesLoading ? (
                <View className="py-20">
                  <ActivityIndicator size="large" color="#ffffff" />
                </View>
              ) : gridMemories.length > 0 ? (
                <ProfileContentGrid
                  posts={gridMemories}
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
    </Spotlight>
  );
}
