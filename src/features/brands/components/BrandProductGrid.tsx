import { useRouter } from 'expo-router';

import { MediaGrid } from '@/src/shared/ui';

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
  const router = useRouter();

  return (
    <MediaGrid
      data={products.map(product => ({ id: product.id, imageUri: product.thumbnailUrl || product.imageUrl }))}
      columns={columns}
      onItemPress={item => {
        const product = products.find(p => p.id === item.id);
        if (product) router.push(`/product/${product.id}?type=${product.type}`);
      }}
    />
  );
}
