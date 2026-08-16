// src/features/search/components/UserCard.tsx
import { useRouter } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';

import { Avatar } from '@/src/shared/ui';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
    bio: string;
    followersCount: number;
  };
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/user/${user.id}`)}
      className="flex-row items-center p-4 border-b border-white/5"
      activeOpacity={0.7}
    >
      <Avatar uri={user.avatarUrl} label={user.name || user.username} size={56} />
      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-white">{user.name || user.username}</Text>
        <Text className="text-sm text-gray-400">@{user.username}</Text>
        {user.bio && (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
            {user.bio}
          </Text>
        )}
        {user.followersCount > 0 && (
          <Text className="text-xs text-gray-500 mt-0.5">{user.followersCount} spotters</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
