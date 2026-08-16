// ========================================
// src/features/user/components/FollowerItem.tsx - NEW COMPONENT
// ========================================
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import { Avatar } from '@/src/shared/ui';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useFollowUser } from '@/src/features/user/hooks/useFollowUser';
import { useFollowStatus } from '@/src/features/user/hooks/useFollowStatus';

interface FollowerItemProps {
  item: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
    bio?: string | null;
  };
}

export function FollowerItem({ item }: FollowerItemProps) {
  const router = useRouter();
  const authUser = useAppSelector(state => state.auth.user);
  const { follow, isFollowing: followActionLoading, unfollow } = useFollowUser();
  const { data: followStatus } = useFollowStatus(authUser?.id, item.id);

  const isOwnProfile = authUser?.id === item.id;

  const handleFollowToggle = () => {
    if (!authUser) return;

    if (followStatus?.isFollowing) {
      unfollow({ currentUserId: authUser.id, targetUserId: item.id });
    } else {
      follow({ currentUserId: authUser.id, targetUserId: item.id });
    }
  };

  return (
    <TouchableOpacity
      onPress={() => router.push(`/user/${item.id}`)}
      className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <Avatar uri={item.avatarUrl} label={item.name || item.username} size={48} className="mr-3" />
        <View className="flex-1">
          <Text className="font-semibold text-foreground" numberOfLines={1}>
            {item.name || item.username}
          </Text>
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            @{item.username}
          </Text>
          {item.bio && (
            <Text className="text-xs text-muted-foreground mt-1" numberOfLines={1}>
              {item.bio}
            </Text>
          )}
        </View>
      </View>

      {!isOwnProfile && (
        <TouchableOpacity
          onPress={handleFollowToggle}
          disabled={followActionLoading}
          className={`px-4 py-2 rounded-full min-w-[90px] items-center ${
            followStatus?.isFollowing ? 'bg-muted' : 'bg-white'
          }`}
          activeOpacity={0.8}
        >
          {followActionLoading ? (
            <ActivityIndicator size="small" color={followStatus?.isFollowing ? '#FFF' : '#000'} />
          ) : (
            <Text className={`font-semibold text-sm ${followStatus?.isFollowing ? 'text-foreground' : 'text-black'}`}>
              {followStatus?.isFollowing ? 'Spotting' : 'Spot'}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
