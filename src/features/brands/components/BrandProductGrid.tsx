import React from 'react';
import { View, Image, Pressable, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface Prototype {
  id: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  name: string;
}

interface BrandProductGridProps {
  products: Prototype[];
  onProductPress: (productId: string) => void;
  columns?: number;
}

export function BrandProductGrid({ products, onProductPress, columns = 3 }: BrandProductGridProps) {
  const itemWidth = (width - (columns + 1) * 2) / columns; // 2px gap

  return (
    <View className="flex-row flex-wrap" style={{ gap: 2 }}>
      {products.map(product => (
        <Pressable
          key={product.id}
          onPress={() => onProductPress(product.id)}
          style={{ width: itemWidth, height: itemWidth }}
          className="bg-white/5"
        >
          <Image
            source={{
              uri:
                product.thumbnailUrl ||
                product.imageUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400`,
            }}
            style={{ width: itemWidth, height: itemWidth }}
            className="bg-white/10"
          />
        </Pressable>
      ))}
    </View>
  );
}
