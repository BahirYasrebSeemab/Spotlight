import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMemory } from '@/src/features/memories/services/memories.services';
import type { CreateMemoryInput } from '@/src/features/memories/types/memories.types';

export function useCreateMemory() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (input: CreateMemoryInput) => {
      const { data, error } = await createMemory(input);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate user memories
      queryClient.invalidateQueries({ queryKey: ['user-memories', variables.userId] });
      // Invalidate user profile (to update memoriesCount)
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] });
    },
  });

  return {
    create: mutation.mutate,
    createAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
