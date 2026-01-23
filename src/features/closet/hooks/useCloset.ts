// src/features/closet/hooks/useCloset.ts
// Custom hooks for closet feature using React Query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserOwnerships,
  getOwnershipById,
  deleteOwnership,
  updateOwnership,
  getUserOwnershipCount,
  getOwnershipsByCategory,
} from '../services/closet.services';
import { OwnershipWithProduct, Ownership } from '../types/closet.types';

/**
 * Hook to fetch all user ownerships
 */
export function useUserOwnerships(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-ownerships', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      const { data, error } = await getUserOwnerships(userId);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Hook to fetch a single ownership by ID
 */
export function useOwnership(ownershipId: string | undefined) {
  return useQuery({
    queryKey: ['ownership', ownershipId],
    queryFn: async () => {
      if (!ownershipId) throw new Error('Ownership ID required');
      const { data, error } = await getOwnershipById(ownershipId);
      if (error) throw new Error(error);
      return data;
    },
    enabled: !!ownershipId,
  });
}

/**
 * Hook to delete an ownership
 */
export function useDeleteOwnership(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ownershipId: string) => {
      const { success, error } = await deleteOwnership(ownershipId, userId);
      if (!success || error) throw new Error(error || 'Failed to delete');
      return ownershipId;
    },
    onSuccess: () => {
      // Invalidate and refetch ownerships
      queryClient.invalidateQueries({ queryKey: ['user-ownerships', userId] });
      queryClient.invalidateQueries({ queryKey: ['user-ownership-count', userId] });
    },
  });
}

/**
 * Hook to update ownership details
 */
export function useUpdateOwnership(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      ownershipId,
      updates,
    }: {
      ownershipId: string;
      updates: Partial<Pick<Ownership, 'condition' | 'notes' | 'purchasePrice' | 'purchaseDate' | 'status'>>;
    }) => {
      const { data, error } = await updateOwnership(ownershipId, userId, updates);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: (data, variables) => {
      // Update the cache optimistically
      queryClient.invalidateQueries({ queryKey: ['user-ownerships', userId] });
      queryClient.invalidateQueries({ queryKey: ['ownership', variables.ownershipId] });
    },
  });
}

/**
 * Hook to get user ownership count
 */
export function useOwnershipCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-ownership-count', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID required');
      const { count, error } = await getUserOwnershipCount(userId);
      if (error) throw new Error(error);
      return count;
    },
    enabled: !!userId,
  });
}

/**
 * Hook to filter ownerships by category
 */
export function useOwnershipsByCategory(userId: string | undefined, category: string | undefined) {
  return useQuery({
    queryKey: ['user-ownerships', userId, 'category', category],
    queryFn: async () => {
      if (!userId || !category) throw new Error('User ID and category required');
      const { data, error } = await getOwnershipsByCategory(userId, category);
      if (error) throw new Error(error);
      return data || [];
    },
    enabled: !!userId && !!category,
  });
}

/**
 * Hook with derived stats from ownerships
 */
export function useClosetStats(userId: string | undefined) {
  const { data: ownerships } = useUserOwnerships(userId);

  if (!ownerships) {
    return {
      totalItems: 0,
      verifiedItems: 0,
      categories: {},
      brands: {},
    };
  }

  const stats = {
    totalItems: ownerships.length,
    verifiedItems: ownerships.filter(o => o.verified).length,
    categories: {} as Record<string, number>,
    brands: {} as Record<string, number>,
  };

  ownerships.forEach(ownership => {
    const product = ownership.prototype || ownership.communityProduct;
    const category = product?.category;
    const brand = ownership.prototype ? ownership.prototype.brand.name : ownership.communityProduct?.brandName;

    if (category) {
      stats.categories[category] = (stats.categories[category] || 0) + 1;
    }
    if (brand) {
      stats.brands[brand] = (stats.brands[brand] || 0) + 1;
    }
  });

  return stats;
}
