// src/features/user/hooks/useFollowUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUserSmart, unfollowUser } from '../services/follow.services';

export function useFollowUser() {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) =>
      followUserSmart(currentUserId, targetUserId),

    // OPTIMISTIC UPDATE - instant UI feedback
    onMutate: async ({ currentUserId, targetUserId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['follow-status', currentUserId, targetUserId],
      });
      await queryClient.cancelQueries({
        queryKey: ['user-profile', targetUserId],
      });

      // Snapshot previous values
      const previousFollowStatus = queryClient.getQueryData(['follow-status', currentUserId, targetUserId]);
      const previousProfile = queryClient.getQueryData(['user-profile', targetUserId]);

      // Optimistically update follow status
      queryClient.setQueryData(['follow-status', currentUserId, targetUserId], { isFollowing: true });

      // Optimistically update follower count
      queryClient.setQueryData(['user-profile', targetUserId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          followersCount: (old.followersCount || 0) + 1,
        };
      });

      return { previousFollowStatus, previousProfile };
    },

    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFollowStatus) {
        queryClient.setQueryData(
          ['follow-status', variables.currentUserId, variables.targetUserId],
          context.previousFollowStatus,
        );
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(['user-profile', variables.targetUserId], context.previousProfile);
      }
    },

    onSettled: (_, __, variables) => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({
        queryKey: ['follow-status', variables.currentUserId, variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['follow-request-status', variables.currentUserId, variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.currentUserId],
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) =>
      unfollowUser(currentUserId, targetUserId),

    // OPTIMISTIC UPDATE
    onMutate: async ({ currentUserId, targetUserId }) => {
      await queryClient.cancelQueries({
        queryKey: ['follow-status', currentUserId, targetUserId],
      });
      await queryClient.cancelQueries({
        queryKey: ['user-profile', targetUserId],
      });

      const previousFollowStatus = queryClient.getQueryData(['follow-status', currentUserId, targetUserId]);
      const previousProfile = queryClient.getQueryData(['user-profile', targetUserId]);

      queryClient.setQueryData(['follow-status', currentUserId, targetUserId], { isFollowing: false });

      queryClient.setQueryData(['user-profile', targetUserId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          followersCount: Math.max((old.followersCount || 0) - 1, 0),
        };
      });

      return { previousFollowStatus, previousProfile };
    },

    onError: (err, variables, context) => {
      if (context?.previousFollowStatus) {
        queryClient.setQueryData(
          ['follow-status', variables.currentUserId, variables.targetUserId],
          context.previousFollowStatus,
        );
      }
      if (context?.previousProfile) {
        queryClient.setQueryData(['user-profile', variables.targetUserId], context.previousProfile);
      }
    },

    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['follow-status', variables.currentUserId, variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.currentUserId],
      });
    },
  });

  return {
    follow: followMutation.mutate,
    followAsync: followMutation.mutateAsync,
    unfollow: unfollowMutation.mutate,
    unfollowAsync: unfollowMutation.mutateAsync,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
    isFollowing: followMutation.isPending,
    isUnfollowing: unfollowMutation.isPending,
    error: followMutation.error || unfollowMutation.error,
  };
}
