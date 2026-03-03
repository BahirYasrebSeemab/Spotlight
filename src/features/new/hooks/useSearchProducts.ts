import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { useDebounce } from '@/src/shared/hooks/useDebounce';

interface SearchProductsParams {
  name: string;
  brandName: string;
  upc?: string;
}

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

export function useSearchProducts({ name, brandName, upc }: SearchProductsParams) {
  const query = [name, brandName, upc].filter(Boolean).join(' ').trim();
  const debouncedQuery = useDebounce(query, 400);

  return useQuery({
    queryKey: ['product-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];

      const { data, error } = await supabase.rpc('search_all', {
        search_query: debouncedQuery,
        limit_count: 20,
      });

      if (error) throw new Error(error.message);

      return (data || [])
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
    },
    enabled: !!debouncedQuery && debouncedQuery.length >= 2,
    staleTime: 30000,
  });
}
