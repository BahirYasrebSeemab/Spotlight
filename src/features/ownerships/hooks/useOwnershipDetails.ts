import { useQuery } from '@tanstack/react-query';

import { getOwnershipById } from '@/src/features/ownerships/services/ownership.services';

export function useOwnershipDetails(ownershipId: string | undefined) {
  return useQuery({
    enabled: !!ownershipId,
    queryFn: async () => {
      if (!ownershipId) throw new Error('Ownership ID is required');
      const { data, error } = await getOwnershipById(ownershipId);
      if (error) throw new Error(error);
      return data;
    },
    queryKey: ['ownership-details', ownershipId],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
