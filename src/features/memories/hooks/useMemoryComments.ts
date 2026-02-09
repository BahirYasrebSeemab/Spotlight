import { useQuery } from '@tanstack/react-query';
import { getMemoryComments } from '@/src/features/memories/services/memories.services';

export function useMemoryComments(memoryId: string | undefined) {
  return useQuery({
    queryKey: ['memory-comments', memoryId],
    queryFn: async () => {
      if (!memoryId) throw new Error('Memory ID is required');
      const { data, error } = await getMemoryComments(memoryId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!memoryId,
    staleTime: 30 * 1000,
  });
}
