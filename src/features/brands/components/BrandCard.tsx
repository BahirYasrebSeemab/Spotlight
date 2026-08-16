// src/features/brands/components/BrandCard.tsx
import { Text } from 'react-native';

import { Card, VerifiedBadge } from '@/src/shared/ui';

import type { Brand } from '../types/brand.types';

interface BrandCardProps {
  brand: Brand;
  onPress: (brand: Brand) => void;
}

export function BrandCard({ brand, onPress }: BrandCardProps) {
  return (
    <Card
      onPress={() => onPress(brand)}
      imageUri={brand.logoUrl}
      imageLabel={brand.name}
      imageBadge={brand.verified && <VerifiedBadge />}
      title={brand.name}
      subtitle={brand.description}
      subtitleLines={2}
      meta={<Text className="text-xs text-muted-foreground uppercase mt-1">{brand.type}</Text>}
    />
  );
}
