import React from 'react';
import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native';
import { Globe, Instagram, BadgeCheckIcon } from 'lucide-react-native';
import type { BrandProfile } from '../types/brand.types';

interface BrandIdentityProps {
  brand: BrandProfile;
  loading: boolean;
  isFollowing: boolean;
  onFollowToggle: () => void;
  onLogoPress?: () => void;
  onFollowersPress?: () => void;
  followLoading?: boolean;
}

export function BrandIdentity({
  brand,
  loading,
  isFollowing,
  onFollowToggle,
  onLogoPress,
  onFollowersPress,
  followLoading = false,
}: BrandIdentityProps) {
  const getBrandTypeColor = (type: string) => {
    switch (type) {
      case 'INTERNATIONAL':
        return 'bg-purple-500';
      case 'LOCAL':
        return 'bg-blue-500';
      case 'TAILORED':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <View className="p-6 pb-4 border-b border-white/10">
      {/* Logo */}
      <View className="items-center mb-4">
        <Pressable onPress={onLogoPress} disabled={!onLogoPress}>
          <View className="relative">
            <Image
              source={{
                uri: brand.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=160`,
              }}
              className="w-20 h-20 rounded-full bg-white/10"
            />
            {brand.verified && (
              <View className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                <BadgeCheckIcon size={20} color="#000" fill="#fff" />
              </View>
            )}
          </View>
        </Pressable>
      </View>

      {/* Brand Name & Type */}
      <View className="items-center mb-3">
        <Text className="text-2xl font-bold text-white mb-2">{brand.name}</Text>
        <View className={`px-3 py-1 rounded-full ${getBrandTypeColor(brand.type)}`}>
          <Text className="text-white text-xs font-semibold uppercase">{brand.type}</Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-center mb-4 gap-8">
        <View className="items-center">
          <Text className="text-white text-lg font-bold">{formatCount(brand.productsCount)}</Text>
          <Text className="text-gray-400 text-sm">Products</Text>
        </View>
        <Pressable onPress={onFollowersPress} disabled={!onFollowersPress}>
          <View className="items-center">
            <Text className="text-white text-lg font-bold">{formatCount(brand.followersCount)}</Text>
            <Text className="text-gray-400 text-sm">Followers</Text>
          </View>
        </Pressable>
      </View>

      {/* Description */}
      {brand.description && <Text className="text-gray-300 text-center mb-4 leading-5">{brand.description}</Text>}

      {/* Links */}
      <View className="items-center gap-2 mb-4">
        {brand.website && (
          <View className="flex-row items-center gap-2">
            <Globe size={16} color="#9CA3AF" />
            <Text className="text-blue-400 text-sm">{brand.website}</Text>
          </View>
        )}
        {brand.instagram && (
          <View className="flex-row items-center gap-2">
            <Instagram size={16} color="#9CA3AF" />
            <Text className="text-blue-400 text-sm">@{brand.instagram}</Text>
          </View>
        )}
      </View>

      {/* Follow Button */}
      <Pressable
        onPress={onFollowToggle}
        disabled={followLoading}
        className={`py-2.5 rounded-lg ${isFollowing ? 'bg-white/10' : 'bg-white'}`}
      >
        {followLoading ? (
          <ActivityIndicator size="small" color={isFollowing ? '#ffffff' : '#000000'} />
        ) : (
          <Text className={`text-center font-semibold ${isFollowing ? 'text-white' : 'text-black'}`}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
