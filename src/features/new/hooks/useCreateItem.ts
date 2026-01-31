// ========================================
// src/features/new/hooks/useCreateItem.ts
// Hook for creating item ownership
// ========================================
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItemOwnership, checkProcessingStatus } from '../services/item.services';
import { CreateItemPayload, Ownership } from '../types/item.types';
import { useAppSelector } from '@/src/shared/hooks/redux';

export function useCreateItem() {
  const [processingStatus, setProcessingStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>(
    'pending',
  );
  const queryClient = useQueryClient();
  const authUser = useAppSelector(state => state.auth.user);

  const createMutation = useMutation({
    mutationFn: async (payload: CreateItemPayload) => {
      if (!authUser?.id) throw new Error('User not authenticated');
      const { data, error } = await createItemOwnership(payload, authUser.id);
      if (error) throw new Error(error);
      return data!;
    },
    onSuccess: async (ownership: Ownership) => {
      // Invalidate ownerships query to refetch
      queryClient.invalidateQueries({ queryKey: ['user-ownerships', authUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', authUser?.id] });

      // If image was uploaded, start polling for processing status
      if (ownership.originalImageUrl && ownership.processingStatus === 'pending') {
        setProcessingStatus('processing');
        pollProcessingStatus(ownership.id);
      } else {
        setProcessingStatus(ownership.processingStatus as any);
      }
    },
    onError: () => {
      setProcessingStatus('failed');
    },
  });

  const pollProcessingStatus = async (ownershipId: string, maxAttempts = 30) => {
    let attempts = 0;
    const pollInterval = 2000; // 2 seconds

    const poll = async () => {
      attempts++;
      const { data, error } = await checkProcessingStatus(ownershipId);

      if (error || !data) {
        if (attempts >= maxAttempts) {
          setProcessingStatus('failed');
          return;
        }
        setTimeout(poll, pollInterval);
        return;
      }

      if (data.processingStatus === 'completed') {
        setProcessingStatus('completed');
        // Invalidate queries to show processed image
        queryClient.invalidateQueries({ queryKey: ['user-ownerships', authUser?.id] });
        queryClient.invalidateQueries({ queryKey: ['ownership', ownershipId] });
      } else if (data.processingStatus === 'failed') {
        setProcessingStatus('failed');
      } else if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      } else {
        setProcessingStatus('failed');
      }
    };

    setTimeout(poll, pollInterval);
  };

  const createItem = (
    payload: CreateItemPayload,
    options?: { onSuccess?: () => void; onError?: (error: Error) => void },
  ) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        options?.onSuccess?.();
      },
      onError: error => {
        options?.onError?.(error as Error);
      },
    });
  };

  return {
    createItem,
    isLoading: createMutation.isPending,
    error: createMutation.error,
    processingStatus,
    reset: () => {
      setProcessingStatus('pending');
      createMutation.reset();
    },
  };
}
