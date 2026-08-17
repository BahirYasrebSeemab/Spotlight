import { useLocalSearchParams } from 'expo-router';
import { View, Image, Text, ActivityIndicator } from 'react-native';

import { useUserProfile } from '@/src/shared/hooks/useUserProfile';

export default function UserAvatarScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: user, isLoading } = useUserProfile(id);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!user?.avatarUrl) {
    const initial = user?.name?.[0] || user?.username?.[0] || '?';
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <View className="w-56 h-56 rounded-full bg-gray-800 items-center justify-center">
          <Text className="text-white text-8xl font-bold">{initial}</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <Image source={{ uri: user.avatarUrl }} className="w-full aspect-square" resizeMode="contain" />
    </View>
  );
}
