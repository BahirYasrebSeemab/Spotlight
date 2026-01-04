// ========================================
// src/features/user/hooks/useFollowUser.ts (UPDATED)
// ========================================
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUserSmart, unfollowUser } from '../services/follow.services';

export function useFollowUser() {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) =>
      followUserSmart(currentUserId, targetUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', variables.currentUserId, variables.targetUserId] });
      queryClient.invalidateQueries({
        queryKey: ['follow-request-status', variables.currentUserId, variables.targetUserId],
      });
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.currentUserId] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) =>
      unfollowUser(currentUserId, targetUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['follow-status', variables.currentUserId, variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.currentUserId] });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
}
