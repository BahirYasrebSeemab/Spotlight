// src/features/products/hooks/useProductDetail.ts
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../services/product.services';
import type { ProductType } from '../types/product.types';

export function useProductDetails(productId: string, type: ProductType) {
  return useQuery({
    queryKey: ['product-detail', productId, type],
    queryFn: async () => {
      const { data, error } = await getProductById(productId, type);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!productId && !!type,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
