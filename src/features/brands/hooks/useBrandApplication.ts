import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { BrandApplication } from '../types/brand.types';

import { submitBrandApplication } from '../services/brand.services';

export function useBrandApplication() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ application, userId }: { userId: string; application: BrandApplication }) => {
      const { data, error } = await submitBrandApplication(userId, application);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate user brand status
      queryClient.invalidateQueries({ queryKey: ['user-brand-status', variables.userId] });
    },
  });

  return {
    error: mutation.error,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
  };
}
