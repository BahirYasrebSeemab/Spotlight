import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  RefreshControl,
  Pressable,
  Alert,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useState, useLayoutEffect, useRef } from 'react';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { Share, MoreVertical, Lock, Play } from 'lucide-react-native';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { useUserMemories } from '@/src/features/memories/hooks/useUserMemories'; // ← CORRECT IMPORT
import { useFollowStatus } from '@/src/features/user/hooks/useFollowStatus';
import { useFollowUser } from '@/src/features/user/hooks/useFollowUser';
import { useFollowRequests } from '@/src/features/user/hooks/useFollowRequests';
import { useFollowRequestStatus } from '@/src/features/user/hooks/useFollowRequestStatus';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3;
const IDENTITY_HEIGHT = 380;

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAppSelector(state => state.auth.user);
  const router = useRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'memories' | 'matches'>('memories');
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: user, isLoading: userLoading, refetch: refetchUser } = useUserProfile(id);
  const { data: followStatus, refetch: refetchFollowStatus } = useFollowStatus(currentUser?.id, id);
  const { data: requestStatus, refetch: refetchRequestStatus } = useFollowRequestStatus(currentUser?.id, id);

  const isOwnProfile = currentUser?.id === id;
  const shouldFetchMemories = isOwnProfile || !user?.isPrivate || followStatus?.isFollowing;

  // Use CORRECT hook with conditional enable
  const {
    data: memoriesData,
    isLoading: memoriesLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchMemories,
  } = useUserMemories(id, 20);

  const { follow, unfollow, isLoading: followLoading } = useFollowUser();
  const { send, cancel, isSending, isCanceling } = useFollowRequests();

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

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const promises = [refetchUser(), refetchFollowStatus(), refetchRequestStatus()];
      if (shouldFetchMemories) promises.push(refetchMemories());
      await Promise.all(promises);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFollowToggle = () => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'Please sign in to follow users');
      return;
    }
    if (followStatus?.isFollowing) {
      unfollow({ currentUserId: currentUser.id, targetUserId: id });
    } else {
      follow({ currentUserId: currentUser.id, targetUserId: id });
    }
  };

  const handleCancelRequest = () => {
    if (!currentUser) return;
    cancel({ requesterId: currentUser.id, requestedId: id });
  };

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

  if (userLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Text className="text-xl font-bold text-white mb-2">User not found</Text>
        <Text className="text-gray-400 text-center">This user doesn't exist or has been removed</Text>
      </View>
    );
  }

  if (isOwnProfile) {
    router.replace('/(tabs)/profile');
    return null;
  }

  const isPrivateAndNotFollowing = user.isPrivate && !followStatus?.isFollowing;
  const memories = memoriesData?.pages.flatMap(page => page) ?? [];

  const identityTranslateY = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, IDENTITY_HEIGHT],
    extrapolate: 'clamp',
  });

  const identityOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View className="flex-1 bg-black">
      <Animated.FlatList
        data={activeTab === 'memories' && shouldFetchMemories ? (memories as any[]) : []}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{ minHeight: height }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" colors={['#ffffff']} />
        }
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        ListHeaderComponent={() => (
          <View className="bg-black">
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={false} />
          </View>
        )}
        renderItem={({ item }: { item: any }) => (
          <Pressable
            onPress={() => router.push(`/memory/${item.id}` as any)}
            className="bg-gray-900"
            style={{ width: ITEM_SIZE, height: ITEM_SIZE, margin: 1 }}
          >
            <Image
              source={{ uri: item.thumbnailUrl || item.mediaUrl || '' }}
              style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
              resizeMode="cover"
            />
            {item.mediaType === 'video' && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="bg-black/70 rounded-full w-8 h-8 items-center justify-center">
                  <Play size={16} color="#ffffff" fill="#ffffff" />
                </View>
              </View>
            )}
          </Pressable>
        )}
        columnWrapperStyle={{ gap: 2 }}
        ListEmptyComponent={() => {
          if (isPrivateAndNotFollowing) {
            return (
              <View className="items-center justify-center px-8" style={{ height: height - 200 }}>
                <View className="w-24 h-24 rounded-full bg-white/10 items-center justify-center mb-6">
                  <Lock size={40} color="#ffffff" strokeWidth={1.5} />
                </View>
                <Text className="text-2xl font-bold text-white mb-3 text-center">This Account is Private</Text>
                <Text className="text-gray-400 text-center text-base leading-6">
                  Follow this account to see their Memories
                </Text>
              </View>
            );
          }

          if (memoriesLoading) {
            return (
              <View className="items-center justify-center" style={{ height: height - 200 }}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-gray-500 mt-3">Loading memories...</Text>
              </View>
            );
          }

          if (activeTab === 'matches') {
            return (
              <View className="items-center justify-center px-8" style={{ height: height - 200 }}>
                <Text className="text-2xl font-bold text-white mb-3 text-center">Matches Coming Soon</Text>
                <Text className="text-gray-400 text-center leading-6">
                  Create outfit combinations and style matches
                </Text>
              </View>
            );
          }

          return (
            <View className="items-center justify-center" style={{ height: height - 200 }}>
              <EmptyProfileContent isOwnProfile={false} activeTab="memories" />
            </View>
          );
        }}
        ListFooterComponent={() =>
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#ffffff" />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage && activeTab === 'memories' && shouldFetchMemories) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      <Animated.View
        pointerEvents="box-none"
        className="absolute bottom-0 left-0 right-0 bg-black"
        style={{
          height: IDENTITY_HEIGHT,
          transform: [{ translateY: identityTranslateY }],
          opacity: identityOpacity,
        }}
      >
        <ProfileIdentity
          user={user}
          loading={false}
          isOwnProfile={false}
          isFollowing={followStatus?.isFollowing}
          followRequestStatus={requestStatus?.status || null}
          onFollowToggle={handleFollowToggle}
          onCancelRequest={handleCancelRequest}
          onAvatarPress={() => router.push(`/user/${id}/avatar` as any)}
          onFollowersPress={
            isPrivateAndNotFollowing ? undefined : () => router.push(`/user/${user.id}/followers` as any)
          }
          onFollowingPress={
            isPrivateAndNotFollowing ? undefined : () => router.push(`/user/${user.id}/following` as any)
          }
          followLoading={followLoading || isSending || isCanceling}
        />
      </Animated.View>
    </View>
  );
}
