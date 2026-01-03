// app/user/[id]/index.tsx - User Profile with Real Data
import { View, FlatList, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useState, useLayoutEffect } from 'react';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { Share, MoreVertical } from 'lucide-react-native';
import { Pressable, Alert } from 'react-native';

// Import hooks
import { useUserProfile } from '@/src/features/user/hooks/useUserProfile';
import { useUserPosts } from '@/src/features/user/hooks/useUserPosts';
import { useFollowStatus } from '@/src/features/user/hooks/useFollowStatus';
import { useFollowUser } from '@/src/features/user/hooks/useFollowUser';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAppSelector(state => state.user);
  const router = useRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');

  // Fetch user profile
  const { data: user, isLoading: userLoading } = useUserProfile(id);

  // Fetch user posts
  const { data: postsData, isLoading: postsLoading, fetchNextPage, hasNextPage } = useUserPosts(id);

  // Check follow status
  const { data: followStatus } = useFollowStatus(currentUser?.id, id);

  // Follow/unfollow mutation
  const { follow, unfollow, isLoading: followLoading } = useFollowUser();

  const isOwnProfile = currentUser?.id === id;

  // Flatten posts from infinite query
  const posts = postsData?.pages.flatMap(page => page) || [];

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

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'photos') return post.mediaUrl && !post.mediaUrl.includes('.mp4');
    if (activeTab === 'videos') return post.mediaUrl && post.mediaUrl.includes('.mp4');
    return true;
  });

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        inverted
        data={[]}
        keyExtractor={(_, index) => `placeholder-${index}`}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <ProfileIdentity
            user={user}
            loading={false}
            isOwnProfile={false}
            isFollowing={followStatus?.isFollowing}
            onFollowToggle={handleFollowToggle}
            onAvatarPress={() => router.push(`/user/${id}/avatar`)}
          />
        )}
        ListFooterComponent={() => (
          <View>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={false} />
            <View className="min-h-screen">
              {postsLoading ? (
                <View className="py-20">
                  <ActivityIndicator size="large" color="#8B5CF6" />
                </View>
              ) : filteredPosts.length > 0 ? (
                <ProfileContentGrid
                  posts={filteredPosts.map((post: any) => ({
                    id: post.id,
                    imageUrl: post.mediaUrl || '',
                    type: post.mediaUrl?.includes('.mp4') ? ('video' as const) : ('photo' as const),
                  }))}
                  onPostPress={postId => router.push(`/post/${postId}`)}
                  columns={3}
                />
              ) : (
                <EmptyProfileContent isOwnProfile={false} activeTab={activeTab} />
              )}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}
