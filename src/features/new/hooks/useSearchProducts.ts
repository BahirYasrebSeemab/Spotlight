import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/src/lib/supabase';
import { useDebounce } from '@/src/shared/hooks/useDebounce';

interface SearchProductsParams {
  name: string;
  upc?: string;
  brandName: string;
}

interface SearchAllResult {
  id: string;
  name: string;
  imageUrl?: string;
  brandName?: string;
  verified?: boolean;
  similarity?: number;
  type: 'user' | 'product' | 'brand';
  productType?: 'prototype' | 'community';
}

export function useSearchProducts({ brandName, name, upc }: SearchProductsParams) {
  const query = [name, brandName, upc].filter(Boolean).join(' ').trim();
  const debouncedQuery = useDebounce(query, 400);

  return useQuery({
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const { data, error } = await supabase.rpc('search_all', {
        limit_count: 20,
        search_query: debouncedQuery,
      });

      if (error) throw new Error(error.message);

      return (data || [])
        .filter((item: SearchAllResult) => item.type === 'product')
        .map((item: SearchAllResult) => ({
          brandName: item.brandName,
          id: item.id,
          imageUrl: item.imageUrl,
          name: item.name,
          productType: item.productType,
          similarity: item.similarity || 0,
          verified: item.verified,
        }));
    },
    queryKey: ['product-search', debouncedQuery],
    staleTime: 30000,
  });
}
