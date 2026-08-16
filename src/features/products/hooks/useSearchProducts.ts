// src/features/products/hooks/useSearchProducts.ts
import { useQuery } from '@tanstack/react-query';

import { searchProducts } from '../services/product.services';

export function useSearchProducts(query: string) {
  return useQuery({
    enabled: query.length >= 2,
    queryFn: async () => {
      const { data, error } = await searchProducts(query);
      if (error) throw new Error(error);
      return data || [];
    },
    queryKey: ['search-products', query],
    refetchOnMount: false, // ADD THIS
    refetchOnWindowFocus: false, // ADD THIS
    retry: 1, // ADD THIS - only retry once on error
    staleTime: 30 * 1000, // 30 seconds
  });
}
