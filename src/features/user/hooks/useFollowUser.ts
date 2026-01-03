// ========================================
// src/features/profile/hooks/useFollowUser.ts
// ========================================
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser } from '@/src/features/user/services/userServices';

export function useFollowUser() {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) =>
      followUser(currentUserId, targetUserId),
    onSuccess: (_, variables) => {
      // Invalidate follow status
      queryClient.invalidateQueries({
        queryKey: ['follow-status', variables.currentUserId, variables.targetUserId],
      });
      // Invalidate target user profile to update follower count
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.targetUserId],
      });
      // Invalidate current user profile to update following count
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.currentUserId],
      });
      // Invalidate followers/following lists
      queryClient.invalidateQueries({
        queryKey: ['user-followers', variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-following', variables.currentUserId],
      });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }) =>
      unfollowUser(currentUserId, targetUserId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['follow-status', variables.currentUserId, variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.currentUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-followers', variables.targetUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-following', variables.currentUserId],
      });
    },
  });

  return {
    follow: followMutation.mutate,
    unfollow: unfollowMutation.mutate,
    isLoading: followMutation.isPending || unfollowMutation.isPending,
  };
}
