// ========================================
// src/features/profile/hooks/useFollowStatus.ts
// ========================================
import { useQuery } from '@tanstack/react-query';
import { checkFollowStatus } from '@/src/features/user/services/follow.services';

export function useFollowStatus(currentUserId: string | undefined, targetUserId: string | undefined) {
  return useQuery({
    queryKey: ['follow-status', currentUserId, targetUserId],
    queryFn: async () => {
      if (!currentUserId || !targetUserId) return { isFollowing: false };
      const { isFollowing } = await checkFollowStatus(currentUserId, targetUserId);
      return { isFollowing };
    },
    enabled: !!currentUserId && !!targetUserId && currentUserId !== targetUserId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
