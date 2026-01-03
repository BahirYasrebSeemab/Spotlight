// app/(tabs)/profile/index.tsx - Own Profile with Refresh
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
import { useQueryClient } from '@tanstack/react-query';

export default function ProfileScreen() {
  const { user, loading } = useAppSelector(state => state.user);
  const navigation = useNavigation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
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
      // Refetch current user profile
      await queryClient.invalidateQueries({
        queryKey: ['user-profile', user?.id],
      });

      // Refetch user posts if you add that hook later
      await queryClient.invalidateQueries({
        queryKey: ['user-posts', user?.id],
      });

      // Refetch user data from Redux (if you have a refetch action)
      // dispatch(fetchCurrentUser());
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Mock data - replace with real data from hooks
  const posts = [
    // { id: '1', imageUrl: 'https://picsum.photos/400/400', type: 'photo' as const },
    // { id: '2', imageUrl: 'https://picsum.photos/400/600', type: 'video' as const },
  ];

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <FlatList
        inverted
        data={[]}
        keyExtractor={(item, index) => `placeholder-${index}`}
        renderItem={() => null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" colors={['#8B5CF6']} />
        }
        ListHeaderComponent={() => (
          <ProfileIdentity
            user={user}
            loading={false}
            isOwnProfile={true}
            onEditProfile={() => router.push('/(tabs)/profile/edit-profile')}
            onAvatarPress={() => {
              console.log('Avatar pressed');
            }}
          />
        )}
        ListFooterComponent={() => (
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
