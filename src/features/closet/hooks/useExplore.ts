import { useQuery } from '@tanstack/react-query';
import { getExploreContent } from '../services/closet.services';

export function useExplore(userId: string | undefined) {
  return useQuery({
    queryKey: ['explore', userId],
    queryFn: async () => {
      if (!userId) throw new Error('No user');
      const { data, error } = await getExploreContent(userId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}
