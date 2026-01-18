// ========================================
// src/features/new/hooks/useSearchBrands.ts
// Hook for searching brands (autocomplete)
// ========================================
import { useQuery } from '@tanstack/react-query';
import { searchBrands, getAllBrands } from '../newServices/item.services';
import { useDebounce } from '@/src/shared/hooks/useDebounce';

export function useSearchBrands(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ['brand-search', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.length >= 2) {
        const { data, error } = await searchBrands(debouncedQuery);
        if (error) throw new Error(error);
        return data || [];
      } else {
        // If query is too short, return all brands
        const { data, error } = await getAllBrands(50);
        if (error) throw new Error(error);
        return data || [];
      }
    },
    staleTime: 60000, // 1 minute
  });
}
