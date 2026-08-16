import { useQuery } from '@tanstack/react-query';

import { getMemoryById } from '@/src/features/memories/services/memories.services';

export function useMemoryDetails(memoryId: string | undefined, currentUserId?: string) {
  return useQuery({
    enabled: !!memoryId,
    queryFn: async () => {
      if (!memoryId) throw new Error('Memory ID is required');
      const { data, error } = await getMemoryById(memoryId, currentUserId);
      if (error) throw new Error(error);
      return data;
    },
    queryKey: ['memory-details', memoryId, currentUserId],
    staleTime: 30 * 1000, // 30 seconds
  });
}
