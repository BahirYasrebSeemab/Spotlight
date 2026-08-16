// src/features/search/components/UserCard.tsx
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import { Card } from '@/src/shared/ui';

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
    <Card
      onPress={() => router.push(`/user/${user.id}`)}
      imageUri={user.avatarUrl}
      imageLabel={user.name || user.username}
      title={user.name || user.username}
      subtitle={`@${user.username}`}
      meta={
        <>
          {user.bio && (
            <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={1}>
              {user.bio}
            </Text>
          )}
          {user.followersCount > 0 && (
            <Text className="text-xs text-muted-foreground mt-0.5">{user.followersCount} spotters</Text>
          )}
        </>
      }
    />
  );
}
