// src/features/brands/hooks/useSearchBrands.ts
import { useQuery } from '@tanstack/react-query';
import { searchBrands } from '../services/brand.services';

export function useSearchBrands(query: string) {
  return useQuery({
    queryKey: ['search-brands', query],
    queryFn: async () => {
      const { data, error } = await searchBrands(query);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
}
