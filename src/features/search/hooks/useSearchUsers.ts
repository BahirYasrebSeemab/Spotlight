// src/features/search/hooks/useSearchUsers.ts
import { useQuery } from '@tanstack/react-query';

import { searchUsers } from '@/src/features/search/services/searchServices';

export function useSearchUsers(query: string) {
  return useQuery({
    enabled: query.length >= 2, // Only search if 2+ characters
    queryFn: async () => {
      const { data, error } = await searchUsers(query);
      if (error) throw new Error(error);
      return data || [];
    },
    queryKey: ['search-users', query],
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}
