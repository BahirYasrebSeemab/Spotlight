// (tabs)/profile/index.tsx - INVERTED SCROLL Profile
import { View, FlatList, ActivityIndicator } from 'react-native';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { ProfileIdentity } from '@/src/features/user/components/ProfileIdentity';
import { ProfileTabBar } from '@/src/features/user/components/ProfileTabBar';
import { ProfileContentGrid } from '@/src/features/user/components/ProfileContentGrid';
import { EmptyProfileContent } from '@/src/features/user/components/EmptyProfileContent';

export default function ProfileScreen() {
  const { user, loading } = useAppSelector(state => state.user);
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => router.push('/(tabs)/profile/settings')} className="p-2">
          <Settings size={22} color={'white'} />
        </Pressable>
      ),
    });
  }, [router]);

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Mock data - replace with real data
  const posts = [
    { id: '1', imageUrl: 'https://picsum.photos/400/400', type: 'photo' },
    { id: '2', imageUrl: 'https://picsum.photos/400/600', type: 'video' },
  ];
  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* INVERTED FlatList - scrolls UP to see content */}
      <FlatList
        inverted
        data={[]} // Empty data array, we use header/footer for layout
        keyExtractor={(item, index) => `placeholder-${index}`}
        renderItem={() => null}
        ListHeaderComponent={() => (
          // Header appears at BOTTOM (because inverted)
          <ProfileIdentity
            user={{
              ...user,
              postsCount: posts.length,
              followersCount: 0,
              followingCount: 0,
            }}
            loading={false}
            isOwnProfile={true}
            onEditProfile={() => router.push('/(tabs)/profile/edit-profile')}
            onAvatarPress={() => {
              console.log('Avatar pressed');
            }}
          />
        )}
        ListFooterComponent={() => (
          // Footer appears at TOP (because inverted)
          <View>
            <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} isOwnProfile={true} />
            <View className="min-h-screen">
              {/* {posts.length > 0 ? (
                <ProfileContentGrid posts={posts} onPostPress={postId => router.push(`/post/${postId}`)} columns={3} />
              ) : ( */}
              <EmptyProfileContent isOwnProfile={true} activeTab={activeTab} />
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
