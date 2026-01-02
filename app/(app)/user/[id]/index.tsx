// user/[id].tsx - OTHER USERS (also inverted)
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user: currentUser } = useAppSelector(state => state.user);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  // Mock data - replace with API calls
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

  const handleFollowToggle = async () => {
    console.log('Toggle follow for user:', id);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const isOwnProfile = user.id === currentUser?.id;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        inverted // UPWARD SCROLLING
        data={posts}
        keyExtractor={item => item.id}
        numColumns={3}
        renderItem={({ item }) => null}
        ListHeaderComponent={() => (
          // Profile card at BOTTOM
          <ProfileIdentity
            user={user}
            loading={false}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onFollowToggle={handleFollowToggle}
            onAvatarPress={() => router.push(`/user/${id}/avatar`)}
            onEditProfile={isOwnProfile ? () => router.push('/(tabs)/profile/edit') : undefined}
          />
        )}
        ListFooterComponent={() => (
          // Tabs and content at TOP
          <>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={true} />
            {/* {posts.length > 0 ? (
              <ProfileContentGrid posts={posts} onPostPress={postId => router.push(`/post/${postId}`)} />
            ) : (
              <EmptyProfileContent isOwnProfile={true} activeTab={activeTab} />
            )} */}
            <EmptyProfileContent isOwnProfile={true} activeTab={activeTab} />
          </>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
}
