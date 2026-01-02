// components/profile/ProfileStats.tsx
import { View, Text, TouchableOpacity } from 'react-native';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onPostsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

export function ProfileStats({
  postsCount,
  followersCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
}: ProfileStatsProps) {
  return (
    <View className="flex-row justify-around py-5 px-4 bg-white dark:bg-black border-y border-gray-200 dark:border-gray-800">
      <TouchableOpacity onPress={onPostsPress} className="items-center" activeOpacity={0.7}>
        <Text className="text-xl font-bold text-black dark:text-white">{postsCount}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Posts</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onFollowersPress} className="items-center" activeOpacity={0.7}>
        <Text className="text-xl font-bold text-black dark:text-white">{followersCount}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Followers</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onFollowingPress} className="items-center" activeOpacity={0.7}>
        <Text className="text-xl font-bold text-black dark:text-white">{followingCount}</Text>
        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">Following</Text>
      </TouchableOpacity>
    </View>
  );
}
