// app/user/[id]/index.tsx - User Profile Screen (READ-ONLY for others)
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useState, useLayoutEffect } from 'react';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';
import { Share, MoreVertical } from 'lucide-react-native';
import { Pressable, Alert } from 'react-native';
// import { useQuery, useMutation } from '@tanstack/react-query';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAppSelector(state => state.user);
  const router = useRouter();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('all');

  // TODO: Replace with real API calls
  const loading = false;
  const user = {
    id,
    name: 'John Doe',
    username: 'johndoe',
    avatarUrl: 'https://i.pravatar.cc/300',
    bio: 'Designer & Developer 🎨 Building cool stuff',
    postsCount: 12,
    followersCount: 1234,
    followingCount: 567,
  };
  const isFollowing = false;
  // Mock data - replace with real data
  const posts = [
    { id: '1', imageUrl: 'https://picsum.photos/400/400', type: 'photo' },
    { id: '2', imageUrl: 'https://picsum.photos/400/600', type: 'video' },
  ];

  // Uncomment when you have API
  // const { data: user, isLoading: loading } = useQuery({
  //   queryKey: ['user', id],
  //   queryFn: () => fetchUserById(id),
  // });

  // const { data: followData } = useQuery({
  //   queryKey: ['follow-status', currentUser?.id, id],
  //   queryFn: () => getFollowStatus(id),
  //   enabled: !!currentUser && currentUser.id !== id,
  // });

  // const followMutation = useMutation({
  //   mutationFn: (userId: string) => toggleFollow(userId),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(['follow-status', currentUser?.id, id]);
  //     queryClient.invalidateQueries(['user', id]);
  //   },
  // });

  const isOwnProfile = currentUser?.id === id;

  // Set header title
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

  const handleFollowToggle = async () => {
    if (!currentUser) {
      Alert.alert('Sign in required', 'Please sign in to follow users');
      return;
    }
    // followMutation.mutate(id);
    console.log('Toggle follow for user:', id);
  };

  const handleShare = async () => {
    // Share profile
    console.log('Share profile:', user.username);
    // You can use expo-sharing or react-native Share API
  };

  const handleMore = () => {
    Alert.alert('Options', `What do you want to do?`, [
      { text: 'Report User', onPress: () => console.log('Report'), style: 'destructive' },
      { text: 'Block User', onPress: () => console.log('Block'), style: 'destructive' },
      { text: 'Copy Profile Link', onPress: () => console.log('Copy link') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Redirect to own profile if viewing self
  if (isOwnProfile) {
    router.replace('/(tabs)/profile');
    return null;
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        inverted
        data={[]}
        keyExtractor={(item, index) => `placeholder-${index}`}
        renderItem={() => null}
        ListHeaderComponent={() => (
          <ProfileIdentity
            user={user}
            loading={false}
            isOwnProfile={false}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
            onAvatarPress={() => router.push(`/user/${id}/avatar`)}
          />
        )}
        ListFooterComponent={() => (
          <View>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={false} />
            <View className="min-h-screen">
              {/* {posts.length > 0 ? (
                <ProfileContentGrid posts={posts} onPostPress={postId => router.push(`/post/${postId}`)} columns={3} />
              ) : ( */}
                <EmptyProfileContent isOwnProfile={false} activeTab={activeTab} />
              {/* )} */}
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}
