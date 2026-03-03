// src/features/products/hooks/useSearchProducts.ts
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../services/product.services';

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ['search-products', query],
    queryFn: async () => {
      const { data, error } = await searchProducts(query);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false, // ADD THIS
    refetchOnMount: false, // ADD THIS
    retry: 1, // ADD THIS - only retry once on error
  });
}
