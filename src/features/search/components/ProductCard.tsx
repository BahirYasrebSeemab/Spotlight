// src/features/search/components/ProductCard.tsx
import { TouchableOpacity, View, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeCheckIcon, Package } from 'lucide-react-native';
import type { Product } from '@/src/features/products/types/product.types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const isVerified = product.type === 'PROTOTYPE';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/product/${product.id}?type=${product.type}`)}
      className="flex-row items-center p-4 border-b border-white/5"
      activeOpacity={0.7}
    >
      <View className="relative">
        <Image
          source={{ uri: product.thumbnailUrl || product.imageUrl || 'https://via.placeholder.com/60' }}
          className="w-16 h-16 rounded-xl bg-white/10"
        />
        <View className="absolute -bottom-1.5 -right-1.5 rounded-full overflow-hidden">
          {isVerified ? (
            <View className="bg-black rounded-full p-0.5">
              <BadgeCheckIcon size={20} color="#000" fill="#fff" />
            </View>
          ) : (
            <View className="bg-gray-700 rounded-full p-1">
              <Package size={15} color="white" />
            </View>
          )}
        </View>
      </View>

      <View className="flex-1 ml-4">
        <Text className="text-base font-semibold text-white" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="text-sm text-gray-400" numberOfLines={1}>
          {product.brandName}
        </Text>
        <View className="flex-row items-center gap-2 mt-1">
          {product.category && (
            <View className="bg-white/10 px-2 py-0.5 rounded-md">
              <Text className="text-xs text-gray-400">{product.category}</Text>
            </View>
          )}
          {product.retailPrice && <Text className="text-xs text-gray-400">${product.retailPrice}</Text>}
        </View>
        {product.ownershipCount > 0 && (
          <Text className="text-xs text-gray-500 mt-0.5">
            {product.ownershipCount} owner{product.ownershipCount !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
