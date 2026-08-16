// src/features/search/components/UserCard.tsx
import { useRouter } from 'expo-router';
import { TouchableOpacity, View, Image, Text } from 'react-native';

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
      <View className="relative">
        <Image source={{ uri: user.avatarUrl }} className="w-14 h-14 rounded-full bg-white/10" />
      </View>
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
