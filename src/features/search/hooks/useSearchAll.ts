// src/features/search/hooks/useSearchAll.ts
import { useQuery } from '@tanstack/react-query';
import { searchAll, SearchResult } from '@/src/features/search/services/searchServices';

export function useSearchAll(query: string) {
  return useQuery({
    queryKey: ['search-all', query],
    queryFn: async () => {
      const { data, error } = await searchAll(query);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });
}

// Helper hook to filter results by type
export function useSearchAllFiltered(query: string, filterType?: 'USER' | 'PROTOTYPE' | 'COMMUNITY' | 'BRAND') {
  const { data, isLoading, error } = useSearchAll(query);

  const filteredData = filterType ? data?.filter(result => result.type === filterType) : data;

  return {
    data: filteredData,
    isLoading,
    error,
  };
}
