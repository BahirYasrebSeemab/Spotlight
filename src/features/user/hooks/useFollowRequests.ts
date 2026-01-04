// src/features/user/hooks/useFollowRequests.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  sendFollowRequest,
} from '../services/followRequest.services';

export function useFollowRequests() {
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: ({ requesterId, requestedId }: { requesterId: string; requestedId: string }) =>
      sendFollowRequest(requesterId, requestedId),
    onSuccess: (_, variables) => {
      // Invalidate the request status check
      queryClient.invalidateQueries({
        queryKey: ['follow-request-status', variables.requesterId, variables.requestedId],
      });
      // Invalidate the user profile to update stats if needed
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.requestedId],
      });
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptFollowRequest(requestId),
    onSuccess: () => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['received-follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-followers'] });
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['follow-request-status', variables.requesterId, variables.requestedId],
      });
    },
  });

  return {
    send: sendMutation.mutateAsync,
    accept: acceptMutation.mutateAsync,
    reject: rejectMutation.mutateAsync,
    cancel: cancelMutation.mutateAsync,
    isSending: sendMutation.isPending,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isLoading:
      acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending || sendMutation.isPending,
  };
}
