import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppSelector } from '@/src/shared/hooks/redux';

import { followBrand, unfollowBrand } from '../services/brand.services';

export function useFollowBrand() {
  const queryClient = useQueryClient();
  const currentUser = useAppSelector(state => state.auth.user);

  const followMutation = useMutation({
    mutationFn: async ({ userId, brandId }: { userId: string; brandId: string }) => {
      const { success, error } = await followBrand(userId, brandId);
      if (!success) throw new Error(error ?? 'Failed to follow');
      return success;
    },
    onMutate: async ({ brandId }) => {
      await queryClient.cancelQueries({ queryKey: ['brand-profile', brandId, currentUser?.id] });
      const previous = queryClient.getQueryData(['brand-profile', brandId, currentUser?.id]);
      queryClient.setQueryData(['brand-profile', brandId, currentUser?.id], (old: any) => {
        if (!old) return old;
        return { ...old, isFollowing: true, followersCount: (old.followersCount ?? 0) + 1 };
      });
      return { previous };
    },
    onError: (_err, { brandId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['brand-profile', brandId, currentUser?.id], context.previous);
      }
    },
    onSettled: (_, __, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile', brandId, currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['brand-followers', brandId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: async ({ userId, brandId }: { userId: string; brandId: string }) => {
      const { success, error } = await unfollowBrand(userId, brandId);
      if (!success) throw new Error(error ?? 'Failed to unfollow');
      return success;
    },
    onMutate: async ({ brandId }) => {
      await queryClient.cancelQueries({ queryKey: ['brand-profile', brandId, currentUser?.id] });
      const previous = queryClient.getQueryData(['brand-profile', brandId, currentUser?.id]);
      queryClient.setQueryData(['brand-profile', brandId, currentUser?.id], (old: any) => {
        if (!old) return old;
        return { ...old, isFollowing: false, followersCount: Math.max((old.followersCount ?? 1) - 1, 0) };
      });
      return { previous };
    },
    onError: (_err, { brandId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['brand-profile', brandId, currentUser?.id], context.previous);
      }
    },
    onSettled: (_, __, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile', brandId, currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['brand-followers', brandId] });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    error: followMutation.error || unfollowMutation.error,
  };
}
