import { View, ScrollView, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { useUserMemories } from '@/src/features/user/hooks/useUserMemories';

export default function ProfileScreen() {
  const authUser = useAppSelector(state => state.auth.user);
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'memories' | 'matches'>('memories');

  // Fetch full profile data
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(authUser?.id);

  // Fetch user memories
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
          <Settings size={22} color="white" />
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
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
    );
  }

  // Flatten memories from infinite query
  const memories = memoriesData?.pages.flatMap(page => page) || [];

  // Map memories to grid format
  const gridMemories = memories.map((memory: any) => ({
    id: memory.id,
    imageUrl: memory.thumbnailUrl || memory.mediaUrl || '',
    type: memory.mediaType === 'video' ? ('video' as const) : ('photo' as const),
  }));

  // Render content based on active tab
  const renderTabContent = () => {
    if (activeTab === 'memories') {
      if (memoriesLoading) {
        return (
          <View className="py-20">
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        );
      }

      if (gridMemories.length === 0) {
        return <EmptyProfileContent isOwnProfile={true} activeTab="memories" />;
      }

      return (
        <ProfileContentGrid
          posts={gridMemories}
          onPostPress={memoryId => router.push(`/memory/${memoryId}` as any)}
          columns={3}
        />
      );
    }

    if (activeTab === 'matches') {
      // TODO: Matches feature not yet implemented
      return (
        <View className="py-20 items-center px-8">
          <Text className="text-2xl font-bold text-white mb-3 text-center">Matches Coming Soon</Text>
          <Text className="text-gray-400 text-center">
            Create outfit combinations and style matches with your items
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
      <View className="flex-1 bg-black">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={['#ffffff']} />
          }
          onScroll={({ nativeEvent }) => {
            // Implement infinite scroll for memories
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

            if (isCloseToBottom && hasNextPage && !isFetchingNextPage && activeTab === 'memories') {
              fetchNextPage();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* Profile Identity */}
          <ProfileIdentity
            user={profile}
            loading={false}
            isOwnProfile={true}
            onEditProfile={() => router.push('/(tabs)/profile/edit-profile')}
            onAvatarPress={() => {
              console.log('Avatar pressed');
            }}
            onFollowersPress={() => router.push(`/user/${profile.id}/followers` as any)}
            onFollowingPress={() => router.push(`/user/${profile.id}/following` as any)}
          />

          {/* Tab Bar */}
          <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={true} />

          {/* Tab Content */}
          <View className="min-[60%]:">{renderTabContent()}</View>

          {/* Loading More Indicator */}
          {isFetchingNextPage && (
            <View className="py-4">
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          )}
        </ScrollView>
      </View>
  );
}
