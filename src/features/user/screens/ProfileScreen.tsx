import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Text,
  Pressable,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState, useRef } from 'react';
import { Settings } from 'lucide-react-native';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { useUserMemories } from '@/src/features/user/hooks/useUserMemories';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3;
const IDENTITY_HEIGHT = 320;
const IDENTITY_PEEK = IDENTITY_HEIGHT * 0.1;

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
    isLoading: memoriesLoading,
    refetch: refetchMemories,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserMemories(authUser?.id);

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
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  const memories = memoriesData?.pages.flatMap(page => page) ?? [];

  // Identity slides away when scrolling down
  const identityTranslateY = scrollY.interpolate({
    inputRange: [0, IDENTITY_HEIGHT - IDENTITY_PEEK],
    outputRange: [0, -(IDENTITY_HEIGHT - IDENTITY_PEEK)],
    extrapolate: 'clamp',
  });

  const identityOpacity = scrollY.interpolate({
    inputRange: [0, (IDENTITY_HEIGHT - IDENTITY_PEEK) / 2],
    outputRange: [1, 0.5],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-black">
      {/* IDENTITY - sticky at bottom, slides away on scroll */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: IDENTITY_HEIGHT,
          zIndex: 10,
          backgroundColor: '#000000',
          transform: [{ translateY: identityTranslateY }],
          opacity: identityOpacity,
        }}
      >
        <ProfileIdentity
          user={profile}
          loading={false}
          isOwnProfile={true}
          onEditProfile={() => router.push('/(tabs)/profile/edit-profile')}
          onAvatarPress={() => console.log('Avatar pressed')}
          onFollowersPress={() => router.push(`/user/${profile.id}/followers` as any)}
          onFollowingPress={() => router.push(`/user/${profile.id}/following` as any)}
        />
      </Animated.View>

      {/* MAIN FLATLIST - grid only, no nested lists */}
      <Animated.FlatList
        data={activeTab === 'memories' ? (memories as any[]) : []}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{
          paddingBottom: IDENTITY_HEIGHT,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={['#ffffff']} />
        }
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: ({ nativeEvent }: any) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom && hasNextPage && !isFetchingNextPage && activeTab === 'memories') {
              fetchNextPage();
            }
          },
        })}
        scrollEventThrottle={16}
        // Tab bar sticks at top
        ListHeaderComponent={() => (
          <View style={{ backgroundColor: '#000000' }}>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={true} />
          </View>
        )}
        // Each grid item - pure Image, no nested lists
        renderItem={({ item }: { item: any }) => (
          <Pressable
            onPress={() => router.push(`/memory/${item.id}` as any)}
            style={{
              width: ITEM_SIZE,
              height: ITEM_SIZE,
              margin: 1,
            }}
          >
            <Image
              source={{ uri: item.thumbnailUrl || item.mediaUrl || '' }}
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
              resizeMode="cover"
            />
            {item.mediaType === 'video' && (
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 999,
                  padding: 4,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10 }}>▶</Text>
              </View>
            )}
          </Pressable>
        )}
        columnWrapperStyle={{ gap: 2 }}
        ListEmptyComponent={() => {
          // Loading state
          if (memoriesLoading) {
            return (
              <View style={{ paddingVertical: 80, alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            );
          }
          // Matches tab
          if (activeTab === 'matches') {
            return (
              <View
                style={{
                  minHeight: height * 0.35,
                  alignItems: 'center',
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
                    textAlign: 'center',
                    lineHeight: 24,
                  }}
                >
                  Create outfit combinations and style matches with your items
                </Text>
              </View>
            );
          }
          // Empty memories
          return <EmptyProfileContent isOwnProfile={true} activeTab="memories" />;
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
    </View>
  );
}
