// src/features/search/components/BrandCard.tsx
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheckIcon } from 'lucide-react-native';
import type { Brand } from '@/src/features/brands/types/brand.types';

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/brand/${brand.id}`)}
      className="flex-row items-center p-4 border-b border-white/5"
      activeOpacity={0.7}
    >
      <View className="relative">
        <Image
          source={{
            uri:
              brand.logoUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.name)}&size=56&background=1f1f1f&color=fff`,
          }}
          className="w-14 h-14 rounded-full bg-white/10"
        />
        {brand.verified && (
          <View className="absolute -bottom-1.5 -right-1.5 bg-black rounded-full p-0.5">
            <BadgeCheckIcon size={20} color="#000" fill="#fff" />
          </View>
        )}
      </View>

      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-base font-semibold text-white">{brand.name}</Text>
        </View>
        {brand.description && (
          <Text className="text-sm text-gray-400 mt-0.5" numberOfLines={2}>
            {brand.description}
          </Text>
        )}
        <View className="bg-white/10 self-start px-2 py-0.5 border border-transparent border-r-8 mt-1">
          <Text className="text-xs text-gray-400 uppercase">{brand.type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
