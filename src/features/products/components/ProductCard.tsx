// src/features/products/components/ProductCard.tsx
import { View, Text } from 'react-native';
import { Package } from 'lucide-react-native';

import { Card, VerifiedBadge } from '@/src/shared/ui';

import type { Product } from '../types/product.types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

export function ProductCard({ onPress, product }: ProductCardProps) {
  const isVerified = product.type === 'PROTOTYPE';

  return (
    <Card
      onPress={() => onPress(product)}
      imageShape="square"
      imageSize={64}
      imageUri={product.thumbnailUrl || product.imageUrl}
      imageBadge={
        isVerified ? (
          <VerifiedBadge />
        ) : (
          <View className="bg-gray-500 rounded-full p-1">
            <Package size={10} color="white" />
          </View>
        )
      }
      title={product.name}
      subtitle={product.brandName}
      meta={
        <>
          <View className="flex-row items-center mt-1">
            {product.category && <Text className="text-xs text-muted-foreground">{product.category}</Text>}
            {product.retailPrice && <Text className="text-xs text-muted-foreground ml-2">${product.retailPrice}</Text>}
          </View>
          {product.ownershipCount > 0 && (
            <Text className="text-xs text-muted-foreground mt-1">
              {product.ownershipCount} owner{product.ownershipCount !== 1 ? 's' : ''}
            </Text>
          )}
        </>
      }
    />
  );
}
