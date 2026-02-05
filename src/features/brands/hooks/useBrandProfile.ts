import { useQuery } from '@tanstack/react-query';
import { getBrandProfile } from '../services/brand.services';

export function useBrandProfile(brandId: string | undefined, currentUserId?: string) {
  return useQuery({
    queryKey: ['brand-profile', brandId, currentUserId],
    queryFn: async () => {
      if (!brandId) throw new Error('Brand ID is required');
      const { data, error } = await getBrandProfile(brandId, currentUserId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!brandId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
