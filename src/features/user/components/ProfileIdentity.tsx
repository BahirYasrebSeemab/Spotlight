// src/features/user/components/ProfileIdentity.tsx
import { Edit3, UserPlus, UserCheck, Clock } from 'lucide-react-native';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';

import { ProfileStats } from './ProfileStats';

interface ProfileIdentityProps {
  user: any;
  loading: boolean;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  followLoading?: boolean;
  onEditProfile?: () => void;
  onAvatarPress?: () => void;
  onFollowToggle?: () => void;
  onCancelRequest?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  followRequestStatus?: 'pending' | 'accepted' | 'rejected' | null;
}

export function ProfileIdentity({
  followLoading = false,
  followRequestStatus,
  isFollowing,
  isOwnProfile,
  loading,
  onAvatarPress,
  onCancelRequest,
  onEditProfile,
  onFollowersPress,
  onFollowingPress,
  onFollowToggle,
  user,
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
          <View className="flex-row items-center justify-center py-2.5 rounded-xl bg-white">
            <ActivityIndicator size="small" color="black" />
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
            className="flex-row items-center justify-center py-2.5 rounded-xl bg-gray-800"
            activeOpacity={0.7}
          >
            <Clock size={16} color="#ffffff" />
            <Text className="text-white font-semibold ml-2 text-sm">Requested</Text>
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
            className="flex-row items-center justify-center py-2.5 rounded-xl bg-gray-800"
            activeOpacity={0.7}
          >
            <UserCheck size={16} color="#ffffff" />
            <Text className="text-white font-semibold ml-2 text-sm">Spotting</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Not following (default)
    return (
      <View className="mt-3">
        <TouchableOpacity
          onPress={onFollowToggle}
          className="flex-row items-center justify-center py-2.5 rounded-xl bg-white"
          activeOpacity={0.7}
        >
          <UserPlus size={16} color="black" />
          <Text className="text-black font-semibold ml-2 text-sm">{user?.isPrivate ? 'Request to Spot' : 'Spot'}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="bg-black rounded-t-3xl shadow-2xl pb-6 pt-4 px-5 border-t border-gray-800">
      {/* Top Handle Bar */}
      <View className="flex-row items-center justify-center mb-4">
        <View className="w-12 h-1.5 bg-gray-600 rounded-full" />
      </View>

      <View className="flex-row items-start">
        {/* Avatar Section */}
        <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.8} className="mr-3">
          {loading ? (
            <View className="w-20 h-20 rounded-2xl bg-gray-800 items-center justify-center">
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : (
            <View className="relative">
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} className="w-20 h-20 rounded-2xl" />
              ) : (
                <View className="w-20 h-20 rounded-2xl bg-gray-800 items-center justify-center">
                  <Text className="text-white text-2xl font-bold">{user?.name?.[0] || user?.username?.[0] || '?'}</Text>
                </View>
              )}
              {/* Private account indicator */}
              {user?.isPrivate && !isOwnProfile && (
                <View className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-1 border border-white/30">
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
              <Text className="text-xl font-bold text-white">{user?.name || user?.username}</Text>
              <Text className="text-sm text-gray-400 mb-2">@{user?.username}</Text>
            </View>
            {isOwnProfile && (
              <TouchableOpacity
                onPress={onEditProfile}
                className="bg-gray-800 p-2 rounded-full w-10 h-10 items-center justify-center ml-2"
                activeOpacity={0.7}
              >
                <Edit3 size={18} color="#ffffff" />
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
      {user?.bio && <Text className="text-sm text-gray-300 mt-3 leading-5">{user.bio}</Text>}

      {/* Private account message for non-followers */}
      {user?.isPrivate && !isOwnProfile && !isFollowing && followRequestStatus !== 'pending' && (
        <View className="mt-3 p-3 bg-gray-800 rounded-xl">
          <Text className="text-sm text-gray-400 text-center">
            🔒 This account is private. Spot to see their content.
          </Text>
        </View>
      )}

      {/* Follow Button */}
      {renderFollowButton()}
    </View>
  );
}
