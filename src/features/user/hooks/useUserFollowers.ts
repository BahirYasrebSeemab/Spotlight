// src/features/user/hooks/useUserFollowers.ts - HANDLE PRIVATE ACCOUNTS
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserFollowers } from '@/src/features/user/services/follow.services';

interface UseUserFollowersOptions {
  enabled?: boolean;
}

export function useUserFollowers(userId: string | undefined, options?: UseUserFollowersOptions, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['user-followers', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserFollowers(userId, limit, pageParam as number);

      // Handle private account case
      if (error === 'PRIVATE_ACCOUNT') {
        return { isPrivate: true, followers: [] };
      }

      if (error) throw new Error(error);
      return { isPrivate: false, followers: data || [] };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.isPrivate || !lastPage.followers || lastPage.followers.length < limit) {
        return undefined;
      }
      return allPages.length * limit;
    },
    enabled: options?.enabled !== undefined ? options.enabled && !!userId : !!userId,
  });
}
