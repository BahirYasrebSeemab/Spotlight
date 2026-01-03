// src/features/user/components/ProfileIdentity.tsx - FIXED with proper stats
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Edit3, UserPlus, UserCheck } from 'lucide-react-native';
import { ProfileStats } from './ProfileStats';
import { useRouter } from 'expo-router';

interface ProfileIdentityProps {
  user: any;
  loading: boolean;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onEditProfile?: () => void;
  onFollowToggle?: () => void;
  onAvatarPress?: () => void;
}

export function ProfileIdentity({
  user,
  loading,
  isOwnProfile,
  isFollowing,
  onEditProfile,
  onFollowToggle,
  onAvatarPress,
}: ProfileIdentityProps) {
  const router = useRouter();

  return (
    <View className="bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl pb-6 pt-4 px-5 border-t border-gray-200 dark:border-gray-800">
      {/* Top Handle Bar */}
      <View className="flex-row items-center justify-center mb-4">
        <View className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </View>

      <View className="flex-row items-start">
        {/* Avatar Section */}
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8} className="mr-3">
          {loading ? (
            <View className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-800 items-center justify-center">
              <ActivityIndicator color="#8B5CF6" />
            </View>
          ) : user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="w-20 h-20 rounded-2xl" />
          ) : (
            <View className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center">
              <Text className="text-white text-2xl font-bold">{user?.name?.[0] || user?.username?.[0] || '?'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View className="flex-1">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xl font-bold text-black dark:text-white">{user?.name || user?.username}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{user?.username}</Text>
            </View>
            {isOwnProfile && (
              <TouchableOpacity
                onPress={onEditProfile}
                className="bg-gray-100 dark:bg-gray-900 p-2 rounded-full h-10 w-10 items-center justify-center"
                activeOpacity={0.7}
              >
                <Edit3 size={18} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </View>

          <ProfileStats
            postsCount={user?.postsCount ?? 0}
            followersCount={user?.followersCount ?? 0}
            followingCount={user?.followingCount ?? 0}
            onFollowersPress={() => router.push(`(app)/user/${user?.id}/followers`)}
            onFollowingPress={() => router.push(`(app)/user/${user?.id}/following`)}
            // onPostsPress={() => router.push(`(app)/user/${user?.id}/posts`)}
          />
        </View>
      </View>

      {/* Bio */}
      {user?.bio && <Text className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-5">{user.bio}</Text>}

      {/* Follow Button (only for other users) */}
      {!isOwnProfile && (
        <View className="mt-3">
          <TouchableOpacity
            onPress={onFollowToggle}
            className={`flex-row items-center justify-center py-2.5 rounded-xl ${
              isFollowing ? 'bg-gray-200 dark:bg-gray-800' : 'bg-purple-600'
            }`}
          >
            {isFollowing ? (
              <>
                <UserCheck size={16} color="#8B5CF6" />
                <Text className="text-purple-600 font-semibold ml-2 text-sm">Spotting</Text>
              </>
            ) : (
              <>
                <UserPlus size={16} color="white" />
                <Text className="text-white font-semibold ml-2 text-sm">Spot</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
