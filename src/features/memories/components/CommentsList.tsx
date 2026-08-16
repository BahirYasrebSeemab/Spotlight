import React, { useState } from 'react';
import { Send } from 'lucide-react-native';
import { View, Text, FlatList, TextInput, Pressable, Image, ActivityIndicator, Alert } from 'react-native';

import type { Comment } from '@/src/features/memories/types/memories.types';

import { useAddComment } from '@/src/features/memories/hooks/useAddComment';
import { useMemoryComments } from '@/src/features/memories/hooks/useMemoryComments';

interface CommentsListProps {
  memoryId: string;
  currentUserId: string;
}

export function CommentsList({ currentUserId, memoryId }: CommentsListProps) {
  const [commentText, setCommentText] = useState('');
  const { data: comments, isLoading } = useMemoryComments(memoryId);
  const { addComment, isAdding } = useAddComment();

  const handleSendComment = () => {
    if (!commentText.trim()) return;

    addComment(
      {
        content: commentText.trim(),
        memoryId,
        userId: currentUserId,
      },
      {
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to post comment');
        },
        onSuccess: () => {
          setCommentText('');
        },
      },
    );
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View className="flex-row gap-3 mb-4">
      <Image source={{ uri: item.user.avatarUrl }} className="w-8 h-8 rounded-full bg-white/10" />
      <View className="flex-1">
        <Text className="text-white font-semibold text-sm">{item.user.name || `@${item.user.username}`}</Text>
        <Text className="text-gray-300 text-sm mt-1 leading-5">{item.content}</Text>
        <Text className="text-gray-500 text-xs mt-1">
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            month: 'short',
          })}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View className="py-8 items-center">
        <ActivityIndicator size="small" color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Comments List */}
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <View className="py-8 items-center">
            <Text className="text-gray-400">No comments yet</Text>
            <Text className="text-gray-500 text-sm mt-1">Be the first to comment!</Text>
          </View>
        )}
      />

      {/* Comment Input */}
      <View className="flex-row items-center gap-3 pt-4 pb-2 border-t border-white/10">
        <TextInput
          value={commentText}
          onChangeText={setCommentText}
          placeholder="Add a comment..."
          placeholderTextColor="#6B7280"
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-white"
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSendComment}
          disabled={!commentText.trim() || isAdding}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            commentText.trim() && !isAdding ? 'bg-white' : 'bg-white/20'
          }`}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <Send size={18} color={commentText.trim() ? '#000000' : '#6B7280'} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
