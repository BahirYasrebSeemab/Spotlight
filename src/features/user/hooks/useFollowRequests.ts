// src/features/user/hooks/useFollowRequests.ts (Enhanced)
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

    onMutate: async ({ requesterId, requestedId }) => {
      // Optimistically show "Requested" state
      await queryClient.cancelQueries({
        queryKey: ['follow-request-status', requesterId, requestedId],
      });

      queryClient.setQueryData(['follow-request-status', requesterId, requestedId], { status: 'pending', id: 'temp' });
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['follow-request-status', variables.requesterId, variables.requestedId],
      });
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.requestedId],
      });
    },

    onError: (_, variables) => {
      // Clear optimistic update on error
      queryClient.setQueryData(['follow-request-status', variables.requesterId, variables.requestedId], null);
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requestId: string) => acceptFollowRequest(requestId),

    onMutate: async requestId => {
      // Optimistically remove from list
      await queryClient.cancelQueries({ queryKey: ['received-follow-requests'] });

      const previousRequests = queryClient.getQueryData(['received-follow-requests']);

      queryClient.setQueryData(['received-follow-requests'], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) => page.filter((req: any) => req.id !== requestId)),
        };
      });

      return { previousRequests };
    },

    onError: (_, __, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['received-follow-requests'], context.previousRequests);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-follow-requests'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-followers'] });
      queryClient.invalidateQueries({ queryKey: ['follow-status'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) => rejectFollowRequest(requestId),

    onMutate: async requestId => {
      await queryClient.cancelQueries({ queryKey: ['received-follow-requests'] });

      const previousRequests = queryClient.getQueryData(['received-follow-requests']);

      queryClient.setQueryData(['received-follow-requests'], (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any[]) => page.filter((req: any) => req.id !== requestId)),
        };
      });

      return { previousRequests };
    },

    onError: (_, __, context) => {
      if (context?.previousRequests) {
        queryClient.setQueryData(['received-follow-requests'], context.previousRequests);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['received-follow-requests'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: ({ requesterId, requestedId }: { requesterId: string; requestedId: string }) =>
      cancelFollowRequest(requesterId, requestedId),

    onMutate: async ({ requesterId, requestedId }) => {
      // Optimistically clear request status
      queryClient.setQueryData(['follow-request-status', requesterId, requestedId], null);
    },

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['follow-request-status', variables.requesterId, variables.requestedId],
      });
    },
  });

  return {
    send: sendMutation.mutate,
    sendAsync: sendMutation.mutateAsync,
    accept: acceptMutation.mutate,
    acceptAsync: acceptMutation.mutateAsync,
    reject: rejectMutation.mutate,
    rejectAsync: rejectMutation.mutateAsync,
    cancel: cancelMutation.mutate,
    cancelAsync: cancelMutation.mutateAsync,

    isSending: sendMutation.isPending,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isLoading:
      acceptMutation.isPending || rejectMutation.isPending || cancelMutation.isPending || sendMutation.isPending,

    error: sendMutation.error || acceptMutation.error || rejectMutation.error || cancelMutation.error,
  };
}
