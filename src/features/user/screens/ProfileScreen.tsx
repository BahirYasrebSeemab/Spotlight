import { Settings, Play } from 'lucide-react-native';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, RefreshControl, Text, Pressable, Image, Dimensions, Animated } from 'react-native';

import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { useUserMemories } from '@/src/features/memories/hooks/useUserMemories';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';

const { height, width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3;

export default function ProfileScreen() {
  const authUser = useAppSelector(state => state.auth.user);
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'memories' | 'matches'>('memories');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useUserProfile(authUser?.id);

  const {
    data: memoriesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: memoriesLoading,
    refetch: refetchMemories,
  } = useUserMemories(authUser?.id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/(tabs)/profile/settings')} className="p-2">
          <Settings size={22} color="white" />
        </Pressable>
      ),
    });
  }, [router, navigation]);

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
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const memories = memoriesData?.pages.flatMap(page => page) ?? [];

  return (
    <View className="flex-1 bg-black">
      {/* SCROLLABLE CONTENT - covers full screen */}
      <Animated.FlatList
        data={activeTab === 'memories' ? (memories as any[]) : []}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        stickyHeaderIndices={[0]}
        // NO paddingBottom - content can scroll behind identity
        contentContainerStyle={{
          minHeight: height,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={['#ffffff']} />
        }
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        scrollEventThrottle={16}
        ListHeaderComponent={() => (
          <View style={{ backgroundColor: '#000000' }}>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={true} />
          </View>
        )}
        renderItem={({ item }: { item: any }) => (
          <Pressable
            onPress={() => router.push(`/memory/${item.id}` as any)}
            style={{
              backgroundColor: '#1a1a1a',
              height: ITEM_SIZE,
              margin: 1,
              width: ITEM_SIZE,
            }}
          >
            <Image
              source={{ uri: item.thumbnailUrl || item.mediaUrl || '' }}
              style={{ height: ITEM_SIZE, width: ITEM_SIZE }}
              resizeMode="cover"
            />
            {item.mediaType === 'video' && (
              <View
                style={{
                  alignItems: 'center',
                  inset: 0,
                  justifyContent: 'center',
                  position: 'absolute',
                }}
              >
                <View
                  style={{
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: 999,
                    height: 32,
                    justifyContent: 'center',
                    width: 32,
                  }}
                >
                  <Play size={16} color="#ffffff" fill="#ffffff" />
                </View>
              </View>
            )}
          </Pressable>
        )}
        columnWrapperStyle={{ gap: 2 }}
        ListEmptyComponent={() => {
          if (memoriesLoading) {
            return (
              <View
                style={{
                  alignItems: 'center',
                  height: height - 200,
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: '#6B7280', marginTop: 12 }}>Loading memories...</Text>
              </View>
            );
          }

          if (activeTab === 'matches') {
            return (
              <View
                style={{
                  alignItems: 'center',
                  height: height - 200,
                  justifyContent: 'center',
                  paddingHorizontal: 32,
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 'bold',
                    marginBottom: 12,
                    textAlign: 'center',
                  }}
                >
                  Matches Coming Soon
                </Text>
                <Text
                  style={{
                    color: '#6B7280',
                    lineHeight: 24,
                    textAlign: 'center',
                  }}
                >
                  Create outfit combinations and style matches
                </Text>
              </View>
            );
          }

          return (
            <View
              style={{
                alignItems: 'center',
                height: height - 200,
                justifyContent: 'center',
              }}
            >
              <EmptyProfileContent isOwnProfile={true} activeTab="memories" />
            </View>
          );
        }}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View style={{ paddingVertical: 16 }}>
              <ActivityIndicator size="small" color="#ffffff" />
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
      />

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
  );
}
