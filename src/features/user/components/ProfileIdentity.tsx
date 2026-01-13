// src/features/user/components/ProfileIdentity.tsx
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Edit3, UserPlus, UserCheck, Clock } from 'lucide-react-native';
import { ProfileStats } from './ProfileStats';

interface ProfileIdentityProps {
  user: any;
  loading: boolean;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  followRequestStatus?: 'pending' | 'accepted' | 'rejected' | null;
  onEditProfile?: () => void;
  onFollowToggle?: () => void;
  onCancelRequest?: () => void;
  onAvatarPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  followLoading?: boolean;
}

export function ProfileIdentity({
  user,
  loading,
  isOwnProfile,
  isFollowing,
  followRequestStatus,
  onEditProfile,
  onFollowToggle,
  onCancelRequest,
  onAvatarPress,
  onFollowersPress,
  onFollowingPress,
  followLoading = false,
}: ProfileIdentityProps) {
  // Determine if stats should be disabled (private account and not following)
  const isPrivateAndNotFollowing = user?.isPrivate && !isOwnProfile && !isFollowing;

  // Determine button state and render
  const renderFollowButton = () => {
    if (isOwnProfile) return null;

    // Show loading state
    if (followLoading) {
      return (
        <View className="mt-3">
          <View className="flex-row items-center justify-center py-2.5 rounded-xl bg-purple-600">
            <ActivityIndicator size="small" color="white" />
          </View>
        </View>
      );
    }

    // Pending request
    if (followRequestStatus === 'pending') {
      return (
        <View className="mt-3">
          <TouchableOpacity
            onPress={onCancelRequest}
            className="flex-row items-center justify-center py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800"
            activeOpacity={0.7}
          >
            <Clock size={16} color="#8B5CF6" />
            <Text className="text-purple-600 font-semibold ml-2 text-sm">Requested</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Already following
    if (isFollowing) {
      return (
        <View className="mt-3">
          <TouchableOpacity
            onPress={onFollowToggle}
            className="flex-row items-center justify-center py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800"
            activeOpacity={0.7}
          >
            <UserCheck size={16} color="#8B5CF6" />
            <Text className="text-purple-600 font-semibold ml-2 text-sm">Spotting</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Not following (default)
    return (
      <View className="mt-3">
        <TouchableOpacity
          onPress={onFollowToggle}
          className="flex-row items-center justify-center py-2.5 rounded-xl bg-purple-600"
          activeOpacity={0.7}
        >
          <UserPlus size={16} color="white" />
          <Text className="text-white font-semibold ml-2 text-sm">{user?.isPrivate ? 'Request to Spot' : 'Spot'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          ) : (
            <View className="relative">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} className="w-20 h-20 rounded-2xl" />
              ) : (
                <View className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center">
                  <Text className="text-white text-2xl font-bold">{user?.name?.[0] || user?.username?.[0] || '?'}</Text>
                </View>
              )}
              {/* Private account indicator */}
              {user?.isPrivate && !isOwnProfile && (
                <View className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-1">
                  <Text className="text-xs">🔒</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Info Section */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-xl font-bold text-black dark:text-white">{user?.name || user?.username}</Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">@{user?.username}</Text>
            </View>
            {isOwnProfile && (
              <TouchableOpacity
                onPress={onEditProfile}
                className="bg-gray-100 dark:bg-gray-900 p-2 rounded-full w-10 h-10 items-center justify-center ml-2"
                activeOpacity={0.7}
              >
                <Edit3 size={18} color="#8B5CF6" />
              </TouchableOpacity>
            )}
          </View>

          {/* Stats using ProfileStats Component */}
          <ProfileStats
            postsCount={user?.postsCount ?? 0}
            followersCount={user?.followersCount ?? 0}
            followingCount={user?.followingCount ?? 0}
            onPostsPress={undefined}
            onFollowersPress={onFollowersPress}
            onFollowingPress={onFollowingPress}
            isPrivateAndNotFollowing={isPrivateAndNotFollowing}
          />
        </View>
      </View>

      {/* Bio */}
      {user?.bio && <Text className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-5">{user.bio}</Text>}

      {/* Private account message for non-followers */}
      {user?.isPrivate && !isOwnProfile && !isFollowing && followRequestStatus !== 'pending' && (
        <View className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded-xl">
          <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
            🔒 This account is private. Spot to see their content.
          </Text>
        </View>
      )}

      {/* Follow Button */}
      {renderFollowButton()}
    </View>
  );
}
