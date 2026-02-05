import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitBrandApplication } from '../services/brand.services';
import type { BrandApplication } from '../types/brand.types';

export function useBrandApplication() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ userId, application }: { userId: string; application: BrandApplication }) => {
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
    submit: mutation.mutate,
    submitAsync: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
