import React from 'react';
import { View, ScrollView, Image, Text, ActivityIndicator, Pressable, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useMemoryDetails } from '../hooks/useMemoryDetails';
import { LikeButton } from '../components/LikeButton';
import { CommentsList } from '@/src/features/memories/components/CommentsList';
import { MoreVertical, Tag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function MemoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const currentUser = useAppSelector(state => state.auth.user);

  const { data: memory, isLoading, error } = useMemoryDetails(id, currentUser?.id);

  const isOwner = currentUser?.id === memory?.userId;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Memory',
      headerRight: () =>
        isOwner ? (
          <Pressable onPress={handleMore} className="p-2">
            <MoreVertical size={22} color="white" />
          </Pressable>
        ) : null,
    });
  }, [isOwner]);

  const handleMore = () => {
    Alert.alert('Options', '', [
      {
        text: 'Delete Memory',
        onPress: handleDelete,
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Memory?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          // TODO: Implement delete mutation
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (error || !memory) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-8">
        <Text className="text-xl font-bold text-white mb-2">Memory not found</Text>
        <Text className="text-gray-400 text-center">This memory doesn't exist or has been removed</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4">
          <Pressable
            onPress={() => router.push(`/user/${memory.user?.id}` as any)}
            className="flex-row items-center gap-3"
          >
            <Image source={{ uri: memory.user?.avatarUrl }} className="w-10 h-10 rounded-full bg-white/10" />
            <View>
              <Text className="text-white font-semibold">{memory.user?.name || `@${memory.user?.username}`}</Text>
              <Text className="text-gray-400 text-xs">
                {new Date(memory.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Media */}
        <Image
          source={{ uri: memory.mediaUrl }}
          style={{ width, height: width }}
          className="bg-white/5"
          resizeMode="cover"
        />

        {/* Actions */}
        <View className="flex-row items-center gap-4 p-4">
          <LikeButton
            memoryId={memory.id}
            userId={currentUser?.id || ''}
            isLiked={memory.isLiked || false}
            likesCount={memory.likesCount}
            size={28}
          />
        </View>

        {/* Caption */}
        {memory.caption && (
          <View className="px-4 pb-4">
            <Text className="text-white">
              <Text className="font-semibold">{memory.user?.username} </Text>
              <Text className="text-gray-300 leading-6">{memory.caption}</Text>
            </Text>
          </View>
        )}

        {/* Tagged Items */}
        {memory.items && memory.items.length > 0 && (
          <View className="px-4 pb-4">
            <View className="flex-row items-center gap-2 mb-3">
              <Tag size={16} color="#9CA3AF" />
              <Text className="text-gray-400 font-semibold">Tagged Items</Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {memory.items.map(item => {
                const product = item.ownership.prototype || item.ownership.communityProduct;
                const brand = item.ownership.prototype?.brand;
                const brandName = brand?.name || item.ownership.communityProduct?.brandName;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(`/ownership/${item.ownershipId}` as any)}
                    className="bg-white/10 rounded-lg px-3 py-2 border border-white/20"
                  >
                    <Text className="text-white text-sm font-medium">{product?.name}</Text>
                    <Text className="text-gray-400 text-xs">{brandName}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Comments Section */}
        <View className="px-4 pt-4 border-t border-white/10">
          <Text className="text-white font-bold text-lg mb-4">
            Comments {memory.commentsCount > 0 && `(${memory.commentsCount})`}
          </Text>
          {currentUser && <CommentsList memoryId={memory.id} currentUserId={currentUser.id} />}
        </View>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
