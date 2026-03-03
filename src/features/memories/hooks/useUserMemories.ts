import { useInfiniteQuery } from '@tanstack/react-query';
import { getUserMemories } from '@/src/features/memories/services/memories.services';

export function useUserMemories(userId: string | undefined, limit = 20, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['user-memories', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserMemories(userId, limit, pageParam as number);
      if (error) throw new Error(error);
      return data ?? [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    enabled: !!userId && enabled, // ← ADD enabled parameter
    staleTime: 2 * 60 * 1000,
  });
}
