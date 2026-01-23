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

    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error deleting ownership:', err);
    return { success: false, error: err.message || 'Failed to delete ownership' };
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
