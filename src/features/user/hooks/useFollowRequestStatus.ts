// src/features/user/hooks/useFollowRequestStatus.ts
import { useQuery } from '@tanstack/react-query';
import { checkFollowRequestStatus } from '../services/followRequest.services';

export function useFollowRequestStatus(requesterId?: string, requestedId?: string) {
  return useQuery({
    queryKey: ['follow-request-status', requesterId, requestedId],
    queryFn: async () => {
      if (!requesterId || !requestedId) return null;
      const { data } = await checkFollowRequestStatus(requesterId, requestedId);
      return data;
    },
    enabled: !!requesterId && !!requestedId,
    staleTime: 1000 * 60, // 1 minute
  });
}
