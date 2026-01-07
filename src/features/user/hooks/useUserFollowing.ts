// src/features/user/hooks/useUserFollowing.ts - HANDLE PRIVATE ACCOUNTS
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserFollowing } from '@/src/features/user/services/follow.services';

export function useUserFollowing(userId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['user-following', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserFollowing(userId, limit, pageParam as number);

      // Handle private account case
      if (error === 'PRIVATE_ACCOUNT') {
        return { isPrivate: true, following: [] };
      }

      if (error) throw new Error(error);
      return { isPrivate: false, following: data || [] };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.isPrivate || !lastPage.following || lastPage.following.length < limit) {
        return undefined;
      }
      return allPages.length * limit;
    },
    enabled: !!userId,
  });
}
