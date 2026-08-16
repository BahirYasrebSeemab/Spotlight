import { useMutation, useQueryClient } from '@tanstack/react-query';

import { likeMemory, unlikeMemory } from '@/src/features/memories/services/memories.services';

export function useLikeMemory() {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: async ({ userId, memoryId }: { userId: string; memoryId: string }) => {
      const { success, error } = await likeMemory(userId, memoryId);
      if (!success) throw new Error(error);
      return success;
    },
    onMutate: async ({ memoryId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['memory-details', memoryId] });

      // Snapshot previous value
      const previousMemory = queryClient.getQueryData(['memory-details', memoryId]);

      // Optimistically update
      queryClient.setQueryData(['memory-details', memoryId], (old: any) => ({
        ...old,
        isLiked: true,
        likesCount: (old?.likesCount || 0) + 1,
      }));

      return { previousMemory };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMemory) {
        queryClient.setQueryData(['memory-details', variables.memoryId], context.previousMemory);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memory-details', variables.memoryId] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: async ({ userId, memoryId }: { userId: string; memoryId: string }) => {
      const { success, error } = await unlikeMemory(userId, memoryId);
      if (!success) throw new Error(error);
      return success;
    },
    onMutate: async ({ memoryId }) => {
      await queryClient.cancelQueries({ queryKey: ['memory-details', memoryId] });

      const previousMemory = queryClient.getQueryData(['memory-details', memoryId]);

      queryClient.setQueryData(['memory-details', memoryId], (old: any) => ({
        ...old,
        isLiked: false,
        likesCount: Math.max((old?.likesCount || 0) - 1, 0),
      }));

      return { previousMemory };
    },
    onError: (err, variables, context) => {
      if (context?.previousMemory) {
        queryClient.setQueryData(['memory-details', variables.memoryId], context.previousMemory);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: ['memory-details', variables.memoryId] });
    },
  });

  return {
    like: likeMutation.mutate,
    unlike: unlikeMutation.mutate,
    isLoading: likeMutation.isPending || unlikeMutation.isPending,
    error: likeMutation.error || unlikeMutation.error,
  };
}
