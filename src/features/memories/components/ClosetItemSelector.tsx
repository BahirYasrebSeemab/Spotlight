import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { X, CheckCircle } from 'lucide-react-native';
import { useUserOwnerships } from '@/src/features/closet/hooks/useCloset';
import type { OwnershipWithProduct } from '@/src/features/closet/types/closet.types';

interface ClosetItemSelectorProps {
  visible: boolean;
  userId: string;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

export function ClosetItemSelector({ visible, userId, onClose, onConfirm }: ClosetItemSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data: ownerships, isLoading } = useUserOwnerships(userId);

  const toggleSelection = (ownershipId: string) => {
    setSelectedIds(prev =>
      prev.includes(ownershipId) ? prev.filter(id => id !== ownershipId) : [...prev, ownershipId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    setSelectedIds([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  const renderItem = ({ item }: { item: OwnershipWithProduct }) => {
    const product = item.prototype || item.communityProduct;
    const isSelected = selectedIds.includes(item.id);
    const imageUrl = item.thumbnailUrl || item.processedImageUrl || item.originalImageUrl;

    return (
      <Pressable
        onPress={() => toggleSelection(item.id)}
        className={`flex-row items-center p-3 border-b border-white/10 ${isSelected ? 'bg-white/10' : ''}`}
      >
        <View className="relative">
          <Image
            source={{ uri: imageUrl || 'https://via.placeholder.com/60' }}
            className="w-16 h-16 rounded-lg bg-white/5"
          />
          {isSelected && (
            <View className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
              <CheckCircle size={16} color="#ffffff" fill="#10B981" />
            </View>
          )}
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-white font-semibold" numberOfLines={1}>
            {product?.name}
          </Text>
          <Text className="text-gray-400 text-sm" numberOfLines={1}>
            {item.prototype ? item.prototype.brand.name : item.communityProduct?.brandName}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/90">
        <View className="flex-1 bg-black mt-20 rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-white/10">
            <Text className="text-white text-lg font-bold">Tag Items</Text>
            <Pressable onPress={handleClose} className="p-2">
              <X size={24} color="#ffffff" />
            </Pressable>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#ffffff" />
            </View>
          ) : (
            <FlatList
              data={ownerships}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              ListEmptyComponent={() => (
                <View className="py-20 items-center">
                  <Text className="text-gray-400">No items in your closet</Text>
                  <Text className="text-gray-500 text-sm mt-1">Add items to tag them in memories</Text>
                </View>
              )}
            />
          )}

          {/* Footer */}
          <View className="p-4 border-t border-white/10">
            <Pressable
              onPress={handleConfirm}
              disabled={selectedIds.length === 0}
              className={`py-4 rounded-xl ${selectedIds.length > 0 ? 'bg-white' : 'bg-white/20'}`}
            >
              <Text
                className={`text-center font-bold text-lg ${selectedIds.length > 0 ? 'text-black' : 'text-gray-500'}`}
              >
                Tag {selectedIds.length} {selectedIds.length === 1 ? 'Item' : 'Items'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}