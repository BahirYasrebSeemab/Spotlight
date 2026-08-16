import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { CreateCommentInput } from '@/src/features/memories/types/memories.types';

import { addComment } from '@/src/features/memories/services/memories.services';

export function useAddComment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CreateCommentInput) => {
      const { data, error } = await addComment(input);
      if (error) throw new Error(error);
      return data;
    },
    onMutate: async input => {
      // Optimistically update comments count
      await queryClient.cancelQueries({ queryKey: ['memory-details', input.memoryId] });

      const previousMemory = queryClient.getQueryData(['memory-details', input.memoryId]);

      queryClient.setQueryData(['memory-details', input.memoryId], (old: any) => ({
        ...old,
        commentsCount: (old?.commentsCount || 0) + 1,
      }));

      return { previousMemory };
    },
    onSuccess: (_, variables) => {
      // Invalidate comments list
      queryClient.invalidateQueries({ queryKey: ['memory-comments', variables.memoryId] });
      queryClient.invalidateQueries({ queryKey: ['memory-details', variables.memoryId] });
    },
    onError: (err, variables, context) => {
      if (context?.previousMemory) {
        queryClient.setQueryData(['memory-details', variables.memoryId], context.previousMemory);
      }
    },
  });

  return {
    addComment: mutation.mutate,
    addCommentAsync: mutation.mutateAsync,
    isAdding: mutation.isPending,
    error: mutation.error,
  };
}
