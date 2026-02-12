import { View, FlatList, ActivityIndicator, RefreshControl, Text, Pressable, Dimensions } from 'react-native';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Settings } from 'lucide-react-native';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { useUserMemories } from '@/src/features/memories/hooks/useUserMemories';
import { Spotlight } from '@/src/shared/components/Spotlight';

const { height } = Dimensions.get('window');

export default function ProfileScreen() {
  const authUser = useAppSelector(state => state.auth.user);
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'memories' | 'matches'>('memories');
  const [refreshing, setRefreshing] = useState(false);

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(authUser?.id);

  const {
    data: memoriesData,
    isLoading: memoriesLoading,
    refetch: refetchMemories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserMemories(authUser?.id);

  console.log(memoriesData);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/(tabs)/profile/settings')} className="p-2">
          <Settings size={22} color="white" />
        </Pressable>
      ),
    });
  }, [router]);

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

  if (profileLoading || !profile) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Spotlight>
    );
  }

  // Flatten memories
  const memories = memoriesData?.pages.flatMap(page => page) ?? [];

  const gridMemories = memories.map((memory: any) => ({
    id: memory.id,
    imageUrl: memory.thumbnailUrl || memory.mediaUrl || '',
    type: memory.mediaType === 'video' ? ('video' as const) : ('photo' as const),
  }));

  // Tab content rendered ABOVE identity
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
        return (
          <View style={{ minHeight: height * 0.5 }}>
            <EmptyProfileContent isOwnProfile={true} activeTab="memories" />
          </View>
        );
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
      return (
        <View style={{ minHeight: height * 0.5 }} className="items-center justify-center px-8">
          <Text className="text-2xl font-bold text-white mb-3 text-center">Matches Coming Soon</Text>
          <Text className="text-gray-400 text-center leading-6">
            Create outfit combinations and style matches with your items
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
      <View className="flex-1 bg-black">
        <FlatList
          data={gridMemories}
          keyExtractor={item => item.id}
          numColumns={3}
          // Sticky tab bar at top index 0
          stickyHeaderIndices={[0]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={['#ffffff']} />
          }
          // Tab bar sticks to top
          ListHeaderComponent={() => (
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={true} />
          )}
          // Memories grid - rendered between tabs and identity
          renderItem={
            activeTab === 'memories'
              ? ({ item }) => (
                  <Pressable
                    onPress={() => router.push(`/memory/${item.id}` as any)}
                    style={{
                      flex: 1 / 3,
                      aspectRatio: 1,
                      margin: 1,
                      backgroundColor: '#ffffff10',
                    }}
                  >
                    <View style={{ flex: 1 }} className="bg-white/5">
                      {item.imageUrl ? (
                        <View style={{ flex: 1 }}>
                          <Pressable onPress={() => router.push(`/memory/${item.id}` as any)}>
                            <View
                              style={{
                                width: '100%',
                                aspectRatio: 1,
                              }}
                            >
                              <ProfileContentGrid
                                posts={[item]}
                                onPostPress={id => router.push(`/memory/${id}` as any)}
                                columns={1}
                              />
                            </View>
                          </Pressable>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                )
              : () => null
          }
          // Identity at the bottom
          ListFooterComponent={() => (
            <View>
              {/* Matches empty state */}
              {activeTab === 'matches' && (
                <View style={{ minHeight: height * 0.5 }} className="items-center justify-center px-8">
                  <Text className="text-2xl font-bold text-white mb-3 text-center">Matches Coming Soon</Text>
                  <Text className="text-gray-400 text-center leading-6">
                    Create outfit combinations and style matches with your items
                  </Text>
                </View>
              )}

              {/* Empty memories */}
              {activeTab === 'memories' && gridMemories.length === 0 && !memoriesLoading && (
                <View style={{ minHeight: height * 0.5 }}>
                  <EmptyProfileContent isOwnProfile={true} activeTab="memories" />
                </View>
              )}

              {/* Loading more */}
              {isFetchingNextPage && (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#ffffff" />
                </View>
              )}

              {/* Profile Identity at the bottom */}
              <ProfileIdentity
                user={profile}
                loading={false}
                isOwnProfile={true}
                onEditProfile={() => router.push('/(tabs)/profile/edit-profile')}
                onAvatarPress={() => console.log('Avatar pressed')}
                onFollowersPress={() => router.push(`/user/${profile.id}/followers` as any)}
                onFollowingPress={() => router.push(`/user/${profile.id}/following` as any)}
              />
            </View>
          )}
          ListEmptyComponent={() =>
            memoriesLoading ? (
              <View className="py-20">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            ) : null
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage && activeTab === 'memories') {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={activeTab === 'memories' ? { gap: 2 } : undefined}
        />
      </View>
  );
}
