import React from 'react';
import { Heart } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';

import { useLikeMemory } from '@/src/features/memories/hooks/useLikeMemory';

interface LikeButtonProps {
  size?: number;
  userId: string;
  memoryId: string;
  isLiked: boolean;
  likesCount: number;
}

export function LikeButton({ isLiked, likesCount, memoryId, size = 24, userId }: LikeButtonProps) {
  const { isLoading, like, unlike } = useLikeMemory();

  const handleToggleLike = () => {
    if (isLoading) return;

    if (isLiked) {
      unlike({ memoryId, userId });
    } else {
      like({ memoryId, userId });
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
