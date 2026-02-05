import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followBrand, unfollowBrand } from '../services/brand.services';

export function useFollowBrand() {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async ({ userId, brandId }: { userId: string; brandId: string }) => {
      const { success, error } = await followBrand(userId, brandId);
      if (!success) throw new Error(error);
      return success;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile', variables.brandId] });
      queryClient.invalidateQueries({ queryKey: ['brand-followers', variables.brandId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ userId, brandId }: { userId: string; brandId: string }) => {
      const { success, error } = await unfollowBrand(userId, brandId);
      if (!success) throw new Error(error);
      return success;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile', variables.brandId] });
      queryClient.invalidateQueries({ queryKey: ['brand-followers', variables.brandId] });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    error: followMutation.error || unfollowMutation.error,
  };
}
