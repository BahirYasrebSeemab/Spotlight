import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppSelector } from '@/src/shared/hooks/redux';

import { deleteMemory } from '../services/memories.services';

export function useDeleteMemory() {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(state => state.auth.user);

  return useMutation({
    mutationFn: async (memoryId: string) => {
      if (!currentUser?.id) throw new Error('Not authenticated');
      const { error } = await deleteMemory(memoryId, currentUser.id);
      if (error) throw new Error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}
