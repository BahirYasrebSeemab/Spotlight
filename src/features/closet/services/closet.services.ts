// src/features/closet/services/closet.services.ts
// All Supabase calls for closet feature

import { supabase } from '@/src/lib/supabase';
import { Ownership, OwnershipWithProduct } from '@/src/features/closet/types/closet.types';

/**
 * Get all ownerships for a specific user
 */
export async function getUserOwnerships(
  userId: string,
): Promise<{ data: OwnershipWithProduct[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select(
        `
        *,
        communityProduct:communityProductId (
          id,
          name,
          brandName,
          category,
          imageUrl,
          thumbnailUrl
        ),
        prototype:prototypeId (
          id,
          name,
          category,
          imageUrl,
          thumbnailUrl,
          brand:brandId (
            id,
            name,
            logoUrl,
            verified
          )
        )
      `,
      )
      .eq('ownerId', userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return { data: data as OwnershipWithProduct[], error: null };
  } catch (err: any) {
    console.error('Error fetching user ownerships:', err);
    return { data: null, error: err.message || 'Failed to fetch ownerships' };
  }
}

/**
 * Get a single ownership by ID with full product details
 */
export async function getOwnershipById(
  ownershipId: string,
): Promise<{ data: OwnershipWithProduct | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select(
        `
        *,
        communityProduct:communityProductId (
          id,
          name,
          brandName,
          category,
          description,
          imageUrl,
          thumbnailUrl
        ),
        prototype:prototypeId (
          id,
          name,
          description,
          category,
          sku,
          upc,
          retailPrice,
          imageUrl,
          thumbnailUrl,
          brand:brandId (
            id,
            name,
            description,
            logoUrl,
            verified,
            type
          )
        )
      `,
      )
      .eq('id', ownershipId)
      .single();

    if (error) throw error;
    return { data: data as OwnershipWithProduct, error: null };
  } catch (err: any) {
    console.error('Error fetching ownership:', err);
    return { data: null, error: err.message || 'Failed to fetch ownership' };
  }
}

/**
 * Delete an ownership
 */
export async function deleteOwnership(
  ownershipId: string,
  userId: string,
): Promise<{ success: boolean; error: string | null }> {
  try {
    // First verify ownership belongs to user
    const { data: ownership, error: fetchError } = await supabase
      .from('Ownership')
      .select('id, ownerId, originalImageUrl, processedImageUrl, thumbnailUrl')
      .eq('id', ownershipId)
      .eq('ownerId', userId)
      .single();

    if (fetchError) throw fetchError;
    if (!ownership) throw new Error('Ownership not found or unauthorized');

    // Delete associated images from storage
    const filesToDelete: string[] = [];

    if (ownership.originalImageUrl) {
      const path = ownership.originalImageUrl.split('/item-originals/')[1];
      if (path) filesToDelete.push(path);
    }
    if (ownership.processedImageUrl) {
      const path = ownership.processedImageUrl.split('/item-processed/')[1];
      if (path) filesToDelete.push(path);
    }
    if (ownership.thumbnailUrl) {
      const path = ownership.thumbnailUrl.split('/item-thumbnails/')[1];
      if (path) filesToDelete.push(path);
    }

    // Delete from storage (ignore errors - files might not exist)
    if (filesToDelete.length > 0) {
      await Promise.all([
        supabase.storage
          .from('item-originals')
          .remove([filesToDelete[0]])
          .catch(() => {}),
        supabase.storage
          .from('item-processed')
          .remove([filesToDelete[1]])
          .catch(() => {}),
        supabase.storage
          .from('item-thumbnails')
          .remove([filesToDelete[2]])
          .catch(() => {}),
      ]);
    }

    // Delete ownership record
    const { error: deleteError } = await supabase
      .from('Ownership')
      .delete()
      .eq('id', ownershipId)
      .eq('ownerId', userId);

    if (deleteError) throw deleteError;

    return { error: null, success: true };
  } catch (err: any) {
    console.error('Error deleting ownership:', err);
    return { error: err.message || 'Failed to delete ownership', success: false };
  }
}

/**
 * Update ownership details
 */
export async function updateOwnership(
  ownershipId: string,
  userId: string,
  updates: Partial<Pick<Ownership, 'condition' | 'notes' | 'purchasePrice' | 'purchaseDate' | 'status'>>,
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .update(updates)
      .eq('id', ownershipId)
      .eq('ownerId', userId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Ownership, error: null };
  } catch (err: any) {
    console.error('Error updating ownership:', err);
    return { data: null, error: err.message || 'Failed to update ownership' };
  }
}

/**
 * Get ownership count for user
 */
export async function getUserOwnershipCount(userId: string): Promise<{ count: number; error: string | null }> {
  try {
    const { count, error } = await supabase
      .from('Ownership')
      .select('*', { count: 'exact', head: true })
      .eq('ownerId', userId);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (err: any) {
    console.error('Error fetching ownership count:', err);
    return { count: 0, error: err.message || 'Failed to fetch count' };
  }
}

/**
 * Filter ownerships by category
 */
export async function getOwnershipsByCategory(
  userId: string,
  category: string,
): Promise<{ data: OwnershipWithProduct[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select(
        `
        *,
        communityProduct:communityProductId (
          id,
          name,
          brandName,
          category
        ),
        prototype:prototypeId (
          id,
          name,
          category,
          brand:brandId (
            name
          )
        )
      `,
      )
      .eq('ownerId', userId)
      .or(`communityProduct.category.eq.${category},prototype.category.eq.${category}`)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return { data: data as OwnershipWithProduct[], error: null };
  } catch (err: any) {
    console.error('Error fetching ownerships by category:', err);
    return { data: null, error: err.message || 'Failed to fetch ownerships' };
  }
}

export async function getExploreContent(userId: string) {
  try {
    // Get users that current user follows
    const { data: following, error: followError } = await supabase
      .from('Follower')
      .select('followingId')
      .eq('followerId', userId);

    if (followError) throw followError;

    const followingIds = following?.map((f: any) => f.followingId) ?? [];

    // ── COMMUNITY TAB ──────────────────────────────────────────────────────

    // Memories from ALL public users (80%)
    const { data: communityMemories, error: cmError } = await supabase
      .from('Memory')
      .select(
        `
        id,
        mediaUrl,
        thumbnailUrl,
        mediaType,
        caption,
        likesCount,
        createdAt,
        user:userId (
          id,
          username,
          avatarUrl,
          isPrivate
        )
      `,
      )
      .order('createdAt', { ascending: false })
      .limit(60);

    if (cmError) throw cmError;

    // Community products from public users (20%)
    const { data: communityProducts, error: cpError } = await supabase
      .from('CommunityProduct')
      .select(
        `
        id,
        name,
        brandName,
        imageUrl,
        thumbnailUrl,
        ownershipCount,
        createdAt,
        creator:createdBy (
          id,
          username,
          avatarUrl,
          isPrivate
        )
      `,
      )
      .eq('status', 'ACTIVE')
      .order('createdAt', { ascending: false })
      .limit(15);

    if (cpError) throw cpError;

    const filteredMemories = (communityMemories ?? [])
      .filter((m: any) => {
        const u = Array.isArray(m.user) ? m.user[0] : m.user;
        return !u?.isPrivate;
      })
      .map((m: any) => ({ ...m, _type: 'MEMORY' as const }));

    const filteredProducts = (communityProducts ?? [])
      .filter((p: any) => {
        const c = Array.isArray(p.creator) ? p.creator[0] : p.creator;
        return !c?.isPrivate;
      })
      .map((p: any) => ({ ...p, _type: 'COMMUNITY' as const }));

    // Interleave: every 5th slot is a product, rest memories
    const community: any[] = [];
    let mIdx = 0;
    let pIdx = 0;
    const total = filteredMemories.length + filteredProducts.length;

    for (let i = 0; i < total; i++) {
      if ((i + 1) % 5 === 0 && pIdx < filteredProducts.length) {
        community.push(filteredProducts[pIdx++]);
      } else if (mIdx < filteredMemories.length) {
        community.push(filteredMemories[mIdx++]);
      } else if (pIdx < filteredProducts.length) {
        community.push(filteredProducts[pIdx++]);
      }
    }

    // ── FOLLOWING TAB ──────────────────────────────────────────────────────

    if (followingIds.length === 0) {
      return {
        data: { community, following: [] },
        error: null,
      };
    }

    const { data: memories, error: mError } = await supabase
      .from('Memory')
      .select(
        `
        id,
        mediaUrl,
        thumbnailUrl,
        mediaType,
        caption,
        likesCount,
        createdAt,
        user:userId (
          id,
          username,
          avatarUrl,
          isPrivate
        )
      `,
      )
      .in('userId', followingIds)
      .order('createdAt', { ascending: false })
      .limit(30);

    if (mError) throw mError;

    const { data: ownerships, error: oError } = await supabase
      .from('Ownership')
      .select(
        `
        id,
        thumbnailImageUrl,
        processedImageUrl,
        thumbnailUrl,
        createdAt,
        ownerId,
        prototype:prototypeId (
          id,
          name,
          imageUrl,
          thumbnailUrl,
          brand:brandId (
            name
          )
        ),
        communityProduct:communityProductId (
          id,
          name,
          brandName,
          imageUrl,
          thumbnailUrl
        ),
        owner:ownerId (
          id,
          username,
          avatarUrl,
          isPrivate
        )
      `,
      )
      .in('ownerId', followingIds)
      .order('createdAt', { ascending: false })
      .limit(30);

    if (oError) throw oError;

    const memoriesMapped = (memories ?? [])
      .filter((m: any) => {
        const u = Array.isArray(m.user) ? m.user[0] : m.user;
        return !u?.isPrivate;
      })
      .map((m: any) => ({ ...m, _type: 'MEMORY' as const }));

    const ownershipsMapped = (ownerships ?? [])
      .filter((o: any) => {
        const u = Array.isArray(o.owner) ? o.owner[0] : o.owner;
        return !u?.isPrivate;
      })
      .map((o: any) => ({ ...o, _type: 'OWNERSHIP' as const }));

    const followingFeed = [...memoriesMapped, ...ownershipsMapped].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return {
      data: { community, following: followingFeed },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch explore content' };
  }
}
