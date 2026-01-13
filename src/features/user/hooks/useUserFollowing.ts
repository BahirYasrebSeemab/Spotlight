// src/features/user/hooks/useUserFollowing.ts - HANDLE PRIVATE ACCOUNTS
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserFollowing } from '@/src/features/user/services/follow.services';

interface UseUserFollowingOptions {
  enabled?: boolean;
}

export function useUserFollowing(userId: string | undefined, options?: UseUserFollowingOptions, limit = 20) {
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
    enabled: options?.enabled !== undefined ? options.enabled && !!userId : !!userId,
  });
}
