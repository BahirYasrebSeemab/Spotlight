// src/features/search/hooks/useSearchAll.ts
import { useQuery } from '@tanstack/react-query';

import { searchAll } from '@/src/features/search/services/searchServices';

export function useSearchAll(query: string) {
  return useQuery({
    enabled: query.length >= 2,
    queryFn: async () => {
      const { data, error } = await searchAll(query);
      if (error) throw new Error(error);
      return data || [];
    },
    queryKey: ['search-all', query],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 30 * 1000,
  });
}

// Helper hook to filter results by type
export function useSearchAllFiltered(query: string, filterType?: 'USER' | 'PROTOTYPE' | 'COMMUNITY' | 'BRAND') {
  const { data, error, isLoading } = useSearchAll(query);

  const filteredData = filterType ? data?.filter(result => result.type === filterType) : data;

  return {
    data: filteredData,
    error,
    isLoading,
  };
}
