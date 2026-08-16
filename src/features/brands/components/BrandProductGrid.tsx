import React from 'react';
import { useRouter } from 'expo-router';
import { View, Image, Pressable, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface Prototype {
  id: string;
  name: string;
  type: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
}

interface BrandProductGridProps {
  columns?: number;
  products: Prototype[];
}

export function BrandProductGrid({ columns = 3, products }: BrandProductGridProps) {
  const itemWidth = (width - (columns + 1) * 2) / columns; // 2px gap
  const router = useRouter();
  return (
    <View className="flex-row flex-wrap" style={{ gap: 2 }}>
      {products.map(product => (
        <Pressable
          key={product.id}
          onPress={() => {
            router.push(`/product/${product.id}?type=${product.type}`);
          }}
          style={{ height: itemWidth, width: itemWidth }}
          className="bg-white/5"
        >
          <Image
            source={{
              uri:
                product.thumbnailUrl ||
                product.imageUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=400`,
            }}
            style={{ height: itemWidth, width: itemWidth }}
            className="bg-white/10"
          />
        </Pressable>
      ))}
    </View>
  );
}
