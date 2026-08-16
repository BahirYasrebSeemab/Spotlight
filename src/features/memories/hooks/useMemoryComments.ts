import { useQuery } from '@tanstack/react-query';

import { getMemoryComments } from '@/src/features/memories/services/memories.services';

export function useMemoryComments(memoryId: string | undefined) {
  return useQuery({
    enabled: !!memoryId,
    queryFn: async () => {
      if (!memoryId) throw new Error('Memory ID is required');
      const { data, error } = await getMemoryComments(memoryId);
      if (error) throw new Error(error);
      return data || [];
    },
    queryKey: ['memory-comments', memoryId],
    staleTime: 30 * 1000,
  });
}
