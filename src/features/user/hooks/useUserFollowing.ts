// ========================================
// src/features/profile/hooks/useUserFollowing.ts
// ========================================
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserFollowing } from '@/src/features/user/services/follow.services';

export function useUserFollowing(userId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['user-following', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserFollowing(userId, limit, pageParam as number);
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
