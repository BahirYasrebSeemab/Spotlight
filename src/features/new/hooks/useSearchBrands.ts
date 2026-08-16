// ========================================
// src/features/new/hooks/useSearchBrands.ts
// Hook for searching brands using search_all()
// ========================================
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/src/lib/supabase';
import { useDebounce } from '@/src/shared/hooks/useDebounce';

interface SearchAllResult {
  id: string;
  name: string;
  imageUrl?: string;
  verified?: boolean;
  similarity?: number;
  type: 'user' | 'product' | 'brand';
}

export function useSearchBrands(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        // Return top verified brands when query is empty
        const { data, error } = await supabase
          .from('Brand')
          .select('id, name, logoUrl, verified')
          .eq('verified', true)
          .order('name', { ascending: true })
          .limit(50);

        if (error) throw new Error(error.message);
        return (data || []).map(brand => ({
          id: brand.id,
          imageUrl: brand.logoUrl,
          name: brand.name,
          verified: brand.verified,
        }));
      }

      const { data, error } = await supabase.rpc('search_all', {
        limit_count: 20,
        search_query: debouncedQuery,
      });

      if (error) throw new Error(error.message);

      // Filter to only return brands
      const brands = (data || [])
        .filter((item: SearchAllResult) => item.type === 'brand')
        .map((item: SearchAllResult) => ({
          id: item.id,
          imageUrl: item.imageUrl,
          name: item.name,
          similarity: item.similarity || 0,
          verified: item.verified,
        }));

      return brands;
    },
    queryKey: ['brand-search', debouncedQuery],
    staleTime: 60000, // 1 minute
  });
}
