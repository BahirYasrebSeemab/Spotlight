import { View, Text, ScrollView, Image, ActivityIndicator, Pressable, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Spotlight } from '@/src/shared/components/Spotlight';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useOwnershipDetails } from '@/src/features/ownerships/hooks/useOwnershipDetails';
import {
  CheckCircle,
  Package,
  Calendar,
  DollarSign,
  Hash,
  FileText,
  Edit,
  Trash2,
  MoreVertical,
  ShieldCheck,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function OwnershipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const currentUser = useAppSelector(state => state.auth.user);

  const { data: ownership, isLoading, error } = useOwnershipDetails(id);

  const isOwner = currentUser?.id === ownership?.ownerId;

  // Set header
  useLayoutEffect(() => {
    if (ownership) {
      const product = ownership.prototype || ownership.communityProduct;
      navigation.setOptions({
        title: product?.name || 'Item Details',
        headerRight: () =>
          isOwner ? (
            <Pressable onPress={handleMore} className="p-2">
              <MoreVertical size={22} color="white" />
            </Pressable>
          ) : null,
      });
    }
  }, [ownership, isOwner]);

  const handleMore = () => {
    Alert.alert('Options', '', [
      {
        text: 'Edit Item',
        onPress: () => console.log('Edit - TODO'),
      },
      {
        text: 'Delete Item',
        onPress: handleDelete,
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Item?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          console.log('Delete ownership - TODO');
          // TODO: Implement delete mutation
          router.back();
        },
      },
    ]);
  };

  const handleBrandPress = () => {
    if (ownership?.prototype?.brand) {
      router.push(`/brands/${ownership.prototype.brand.id}` as any);
    }
  };

  const handleOwnerPress = () => {
    if (ownership?.owner && !isOwner) {
      router.push(`/user/${ownership.owner.id}` as any);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 items-center justify-center bg-black">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </Spotlight>
    );
  }

  // Error state
  if (error || !ownership) {
    return (
      <Spotlight intensity={0.2}>
        <View className="flex-1 items-center justify-center bg-black px-8">
          <Text className="text-xl font-bold text-white mb-2">Item not found</Text>
          <Text className="text-gray-400 text-center">This item doesn't exist or has been removed</Text>
        </View>
      </Spotlight>
    );
  }

  const product = ownership.prototype || ownership.communityProduct;
  const brand = ownership.prototype?.brand;
  const brandName = brand?.name || ownership.communityProduct?.brandName;

  // Choose best image
  const imageUrl =
    ownership.processedImageUrl ||
    ownership.originalImageUrl ||
    ownership.thumbnailUrl ||
    product?.imageUrl ||
    product?.thumbnailUrl;

  const isProcessing = ownership.processingStatus === 'pending' || ownership.processingStatus === 'processing';

  return (
    <Spotlight intensity={0.2}>
      <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
        {/* Image Section */}
        <View style={{ width, height: width }} className="bg-white/5">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={{ width, height: width }} resizeMode="cover" />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Package size={80} color="#6B7280" strokeWidth={1.5} />
            </View>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <View className="absolute inset-0 bg-black/70 items-center justify-center">
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-white mt-4 font-medium">Processing Image...</Text>
            </View>
          )}

          {/* Verification Badge */}
          {ownership.verified && (
            <View className="absolute top-4 right-4 bg-black/80 rounded-full px-3 py-2 flex-row items-center gap-2">
              <ShieldCheck size={16} color="#10B981" fill="#10B981" />
              <Text className="text-white text-xs font-semibold">Verified</Text>
            </View>
          )}

          {/* Authentication Badge */}
          {ownership.isAuthenticated && (
            <View className="absolute top-16 right-4 bg-black/80 rounded-full px-3 py-2 flex-row items-center gap-2">
              <CheckCircle size={16} color="#3B82F6" fill="#3B82F6" />
              <Text className="text-white text-xs font-semibold">Authenticated</Text>
            </View>
          )}
        </View>

        <View className="p-6">
          {/* Product Info */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-white mb-2">{product?.name}</Text>

            {/* Brand */}
            {brandName && (
              <Pressable onPress={handleBrandPress} disabled={!brand}>
                <View className="flex-row items-center gap-2 mb-3">
                  {brand?.logoUrl && (
                    <Image source={{ uri: brand.logoUrl }} className="w-6 h-6 rounded-full bg-white/10" />
                  )}
                  <Text className={`text-lg ${brand ? 'text-blue-400' : 'text-gray-400'}`}>{brandName}</Text>
                  {brand?.verified && <CheckCircle size={16} color="#10B981" fill="#10B981" />}
                </View>
              </Pressable>
            )}

            {/* Category */}
            {product?.category && (
              <View className="bg-white/10 self-start px-3 py-1.5 rounded-full">
                <Text className="text-white text-sm">{product.category}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {product?.description && (
            <View className="mb-6">
              <Text className="text-white font-bold text-lg mb-2">Description</Text>
              <Text className="text-gray-300 leading-6">{product.description}</Text>
            </View>
          )}

          {/* Ownership Details */}
          <View className="mb-6">
            <Text className="text-white font-bold text-lg mb-4">Ownership Details</Text>

            {/* Owner */}
            <Pressable onPress={handleOwnerPress} disabled={isOwner} className="mb-4">
              <View className="flex-row items-center gap-3">
                <Image source={{ uri: ownership.owner.avatarUrl }} className="w-12 h-12 rounded-full bg-white/10" />
                <View>
                  <Text className="text-gray-400 text-xs">Owner</Text>
                  <Text className={`text-base font-semibold ${isOwner ? 'text-white' : 'text-blue-400'}`}>
                    {isOwner ? 'You' : ownership.owner.name || `@${ownership.owner.username}`}
                  </Text>
                </View>
              </View>
            </Pressable>

            {/* Condition */}
            {ownership.condition && (
              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                  <Package size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Condition</Text>
                  <Text className="text-white text-base capitalize">{ownership.condition}</Text>
                </View>
              </View>
            )}

            {/* Purchase Date */}
            {ownership.purchaseDate && (
              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                  <Calendar size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Purchase Date</Text>
                  <Text className="text-white text-base">{new Date(ownership.purchaseDate).toLocaleDateString()}</Text>
                </View>
              </View>
            )}

            {/* Purchase Price */}
            {ownership.purchasePrice && (
              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                  <DollarSign size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Purchase Price</Text>
                  <Text className="text-white text-base">${ownership.purchasePrice}</Text>
                </View>
              </View>
            )}

            {/* Serial Number */}
            {ownership.serialNumber && (
              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                  <Hash size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Serial Number</Text>
                  <Text className="text-white text-base font-mono">{ownership.serialNumber}</Text>
                </View>
              </View>
            )}

            {/* Notes */}
            {ownership.notes && (
              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                  <FileText size={20} color="#9CA3AF" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-xs">Notes</Text>
                  <Text className="text-white text-base leading-6">{ownership.notes}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Product Details (if prototype) */}
          {ownership.prototype && (
            <View className="mb-6">
              <Text className="text-white font-bold text-lg mb-4">Product Details</Text>

              {ownership.prototype.retailPrice && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-400">Retail Price</Text>
                  <Text className="text-white font-semibold">${ownership.prototype.retailPrice}</Text>
                </View>
              )}

              {ownership.prototype.sku && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-400">SKU</Text>
                  <Text className="text-white font-mono text-sm">{ownership.prototype.sku}</Text>
                </View>
              )}

              {ownership.prototype.upc && (
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-400">UPC</Text>
                  <Text className="text-white font-mono text-sm">{ownership.prototype.upc}</Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons (if owner) */}
          {isOwner && (
            <View className="flex-row gap-3 mb-8">
              <Pressable
                className="flex-1 bg-white/10 border border-white/20 rounded-xl py-4 flex-row items-center justify-center gap-2"
                onPress={() => console.log('Edit - TODO')}
              >
                <Edit size={20} color="#ffffff" />
                <Text className="text-white font-semibold">Edit</Text>
              </Pressable>

              <Pressable
                className="flex-1 bg-red-500/20 border border-red-500 rounded-xl py-4 flex-row items-center justify-center gap-2"
                onPress={handleDelete}
              >
                <Trash2 size={20} color="#EF4444" />
                <Text className="text-red-500 font-semibold">Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </Spotlight>
  );
}
