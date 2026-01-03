// src/features/search/hooks/useSearchUsers.ts
import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/src/features/search/services/searchServices';

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['search-users', query],
    queryFn: async () => {
      const { data, error } = await searchUsers(query);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: query.length >= 2, // Only search if 2+ characters
    staleTime: 30 * 1000, // Cache for 30 seconds
  });
}
