import { useQuery } from '@tanstack/react-query';
import { getUserBrand } from '../services/brand.services';

export function useUserBrandStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-brand-status', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await getUserBrand(userId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
