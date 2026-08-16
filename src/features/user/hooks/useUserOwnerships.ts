// ========================================
// src/features/profile/hooks/useUserOwnerships.ts
// ========================================
import { useInfiniteQuery } from '@tanstack/react-query';

import { getUserOwnerships } from '@/src/features/user/services/user.services';

export function useUserOwnerships(userId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['user-ownerships', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserOwnerships(userId, limit, pageParam as number);
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
