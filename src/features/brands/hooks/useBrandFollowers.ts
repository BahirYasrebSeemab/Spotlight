import { useInfiniteQuery } from '@tanstack/react-query';

import { getBrandFollowers } from '../services/brand.services';

export function useBrandFollowers(brandId: string | undefined, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['brand-followers', brandId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!brandId) throw new Error('Brand ID is required');
      const { data, error } = await getBrandFollowers(brandId, limit, pageParam);
      if (error) throw new Error(error);
      return data || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    enabled: !!brandId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
