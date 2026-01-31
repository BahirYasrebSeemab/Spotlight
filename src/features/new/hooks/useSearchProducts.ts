// ========================================
// src/features/new/hooks/useSearchProducts.ts
// Hook for searching existing products using search_all()
// ========================================
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useDebounce } from '@/src/shared/hooks/useDebounce';

interface SearchAllResult {
  type: 'user' | 'product' | 'brand';
  id: string;
  name: string;
  imageUrl?: string;
  brandName?: string;
  verified?: boolean;
  productType?: 'prototype' | 'community';
  similarity?: number;
}

export function useSearchProducts(query: string) {
  const debouncedQuery = useDebounce(query, 400);

  return useQuery({
    queryKey: ['product-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return [];
      }

      const { data, error } = await supabase.rpc('search_all', {
        search_query: debouncedQuery,
        limit_count: 20,
      });

      if (error) throw new Error(error.message);

      // Filter to only return products (prototypes + community products)
      const products = (data || [])
        .filter((item: SearchAllResult) => item.type === 'product')
        .map((item: SearchAllResult) => ({
          id: item.id,
          name: item.name,
          brandName: item.brandName,
          imageUrl: item.imageUrl,
          verified: item.verified,
          productType: item.productType,
          similarity: item.similarity || 0,
        }));

      return products;
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30000, // 30 seconds
  });
}
