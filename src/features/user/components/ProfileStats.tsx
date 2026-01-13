// src/features/user/components/ProfileStats.tsx
import { View, Text, TouchableOpacity } from 'react-native';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onPostsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  isPrivateAndNotFollowing?: boolean; // NEW: Disable all buttons for private accounts
}

export function ProfileStats({
  postsCount,
  followersCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
  isPrivateAndNotFollowing = false,
}: ProfileStatsProps) {
  return (
    <View className="flex-row items-center gap-6">
      <TouchableOpacity
        onPress={onPostsPress}
        className="items-center"
        activeOpacity={0.7}
        disabled={!onPostsPress || isPrivateAndNotFollowing}
      >
        <Text
          className={`text-base font-bold ${isPrivateAndNotFollowing ? 'text-gray-400 dark:text-gray-600' : 'text-black dark:text-white'}`}
        >
          {postsCount}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">Owns</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onFollowersPress}
        className="items-center"
        activeOpacity={0.7}
        disabled={!onFollowersPress || isPrivateAndNotFollowing}
      >
        <Text
          className={`text-base font-bold ${isPrivateAndNotFollowing ? 'text-gray-400 dark:text-gray-600' : 'text-black dark:text-white'}`}
        >
          {followersCount}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">Spotters</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onFollowingPress}
        className="items-center"
        activeOpacity={0.7}
        disabled={!onFollowingPress || isPrivateAndNotFollowing}
      >
        <Text
          className={`text-base font-bold ${isPrivateAndNotFollowing ? 'text-gray-400 dark:text-gray-600' : 'text-black dark:text-white'}`}
        >
          {followingCount}
        </Text>
        <Text className="text-xs text-gray-500 dark:text-gray-400">Spotted</Text>
      </TouchableOpacity>
    </View>
  );
}
