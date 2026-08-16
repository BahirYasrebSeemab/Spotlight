// ========================================
// src/features/user/hooks/useReceivedFollowRequests.ts
// ========================================
import { useInfiniteQuery } from '@tanstack/react-query';

import { getReceivedFollowRequests } from '@/src/features/user/services/followRequest.services';

export function useReceivedFollowRequests(userId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['received-follow-requests', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getReceivedFollowRequests(userId, limit, pageParam as number);
      if (error) throw new Error(error);
      return data || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    enabled: !!userId,
  });
}
