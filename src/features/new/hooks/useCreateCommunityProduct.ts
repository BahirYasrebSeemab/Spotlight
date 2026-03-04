// src/features/new/hooks/useCreateCommunityProduct.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {createCommunityProductWithOwnership} from '@/src/features/new/services/communityProduct.services';
import { CreateCommunityProductPayload } from '@/src/features/new/types/item.types';

export function useCreateCommunityProduct() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: CreateCommunityProductPayload) => {
      const { data, error } = await createCommunityProductWithOwnership(payload);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerships'] });
      queryClient.invalidateQueries({ queryKey: ['closet'] });
    },
  });

  return {
    createCommunityProduct: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
  };
}
