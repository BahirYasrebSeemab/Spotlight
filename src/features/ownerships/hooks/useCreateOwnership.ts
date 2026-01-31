// ========================================
// src/features/ownership/hooks/useCreateOwnership.ts
// TanStack Query hook for creating ownership
// ========================================
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOwnership } from '../services/ownership.services';
import { CreateOwnershipPayload, Ownership } from '../types/ownership.types';

export function useCreateOwnership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOwnershipPayload) => {
      const { data, error } = await createOwnership(payload);
      if (error) throw new Error(error);
      return data as Ownership;
    },
    onSuccess: (data) => {
      // Invalidate user's ownerships list
      queryClient.invalidateQueries({ queryKey: ['user-ownerships'] });
      queryClient.invalidateQueries({ queryKey: ['closet'] });
    },
  });
}
