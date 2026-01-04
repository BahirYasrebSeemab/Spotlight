// ========================================
// src/features/user/hooks/useFollowRequestStatus.ts
// ========================================
import { useQuery } from '@tanstack/react-query';
import { checkFollowRequestStatus } from '@/src/features/user/services/followRequest.services';

export function useFollowRequestStatus(currentUserId: string | undefined, targetUserId: string | undefined) {
  return useQuery({
    queryKey: ['follow-request-status', currentUserId, targetUserId],
    queryFn: async () => {
      if (!currentUserId || !targetUserId) return null;
      const { data } = await checkFollowRequestStatus(currentUserId, targetUserId);
      return data;
    },
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
    staleTime: 1 * 60 * 1000,
  });
}
