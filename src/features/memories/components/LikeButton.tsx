import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useLikeMemory } from '@/src/features/memories/hooks/useLikeMemory';

interface LikeButtonProps {
  memoryId: string;
  userId: string;
  isLiked: boolean;
  likesCount: number;
  size?: number;
}

export function LikeButton({ memoryId, userId, isLiked, likesCount, size = 24 }: LikeButtonProps) {
  const { like, unlike, isLoading } = useLikeMemory();

  const handleToggleLike = () => {
    if (isLoading) return;

    if (isLiked) {
      unlike({ userId, memoryId });
    } else {
      like({ userId, memoryId });
    }
  };

  return (
    <Pressable onPress={handleToggleLike} disabled={isLoading} className="flex-row items-center gap-1">
      <Heart
        size={size}
        color={isLiked ? '#EF4444' : '#ffffff'}
        fill={isLiked ? '#EF4444' : 'transparent'}
        strokeWidth={2}
      />
      {likesCount > 0 && <Text className="text-white font-semibold">{likesCount}</Text>}
    </Pressable>
  );
}
