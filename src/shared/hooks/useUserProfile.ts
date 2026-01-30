// ========================================
// src/features/profile/hooks/useUserProfile.ts
// ========================================
import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/src/features/user/services/user.services';

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserProfile(userId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
