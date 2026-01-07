// src/features/user/hooks/useUserFollowers.ts - HANDLE PRIVATE ACCOUNTS
import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserFollowers } from '@/src/features/user/services/follow.services';

export function useUserFollowers(userId: string | undefined, limit = 20) {
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
    enabled: !!userId,
  });
}