// ========================================
// src/features/user/hooks/useFollowRequests.ts
// ========================================
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptFollowRequest, rejectFollowRequest, cancelFollowRequest } from '../services/followRequest.services';

export function useFollowRequests() {
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptFollowRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-followers'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectFollowRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-follow-requests'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ requesterId, requestedId }: { requesterId: string; requestedId: string }) =>
      cancelFollowRequest(requesterId, requestedId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-request-status'] });
    },
  });

  return {
    accept: acceptMutation.mutate,
    reject: rejectMutation.mutate,
    cancel: cancelMutation.mutate,
    isLoading: acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending,
  };
}
