// ========================================
// src/features/profile/hooks/useUserPosts.ts
// ========================================
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserPosts } from '@/src/features/user/services/userServices';

export function useUserPosts(userId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['user-posts', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserPosts(userId, limit, pageParam as number);
      if (error) throw new Error(error);
      return data || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}
