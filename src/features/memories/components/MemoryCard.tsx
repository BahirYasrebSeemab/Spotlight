import React from 'react';
import { MessageCircle, MoreVertical } from 'lucide-react-native';
import { View, Text, Image, Pressable, Dimensions } from 'react-native';

import type { Memory } from '@/src/features/memories/types/memories.types';

import { LikeButton } from './LikeButton';

const { width } = Dimensions.get('window');

interface MemoryCardProps {
  memory: Memory;
  onPress: () => void;
  currentUserId: string;
  onUserPress: () => void;
  onMorePress?: () => void;
}

export function MemoryCard({ currentUserId, memory, onMorePress, onPress, onUserPress }: MemoryCardProps) {
  return (
    <View className="mb-6">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Pressable onPress={onUserPress} className="flex-row items-center gap-3">
          <Image source={{ uri: memory.user?.avatarUrl }} className="w-10 h-10 rounded-full bg-white/10" />
          <View>
            <Text className="text-white font-semibold">{memory.user?.name || `@${memory.user?.username}`}</Text>
            <Text className="text-gray-400 text-xs">
              {new Date(memory.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </View>
        </Pressable>

        {onMorePress && (
          <Pressable onPress={onMorePress} className="p-2">
            <MoreVertical size={20} color="#ffffff" />
          </Pressable>
        )}
      </View>

      {/* Media */}
      <Pressable onPress={onPress}>
        <Image
          source={{ uri: memory.thumbnailUrl || memory.mediaUrl }}
          style={{ height: width, width }}
          className="bg-white/5"
          resizeMode="cover"
        />
      </Pressable>

      {/* Actions */}
      <View className="flex-row items-center gap-4 px-4 mt-3">
        <LikeButton
          memoryId={memory.id}
          userId={currentUserId}
          isLiked={memory.isLiked || false}
          likesCount={memory.likesCount}
          size={26}
        />

        <Pressable onPress={onPress} className="flex-row items-center gap-1">
          <MessageCircle size={26} color="#ffffff" strokeWidth={2} />
          {memory.commentsCount > 0 && <Text className="text-white font-semibold">{memory.commentsCount}</Text>}
        </Pressable>
      </View>

      {/* Caption */}
      {memory.caption && (
        <View className="px-4 mt-3">
          <Text className="text-white">
            <Text className="font-semibold">{memory.user?.username} </Text>
            <Text className="text-gray-300">{memory.caption}</Text>
          </Text>
        </View>
      )}

      {/* Tagged Items */}
      {memory.items && memory.items.length > 0 && (
        <View className="px-4 mt-2">
          <Text className="text-gray-400 text-sm">
            Tagged {memory.items.length} {memory.items.length === 1 ? 'item' : 'items'}
          </Text>
        </View>
      )}

      {/* View Comments Link */}
      {memory.commentsCount > 0 && (
        <Pressable onPress={onPress} className="px-4 mt-2">
          <Text className="text-gray-400 text-sm">
            View {memory.commentsCount === 1 ? 'comment' : `all ${memory.commentsCount} comments`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
