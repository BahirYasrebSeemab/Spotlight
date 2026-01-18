// ========================================
// src/features/new/newServices/item.services.ts
// Centralized Supabase calls for item/ownership operations
// ========================================
import { supabase } from '@/src/lib/supabase';
import { CreateItemPayload, Ownership, CommunityProduct, Prototype, Brand, ProductSearchResult } from '../types/item.types';

/**
 * Search for existing products (Prototype or CommunityProduct)
 * Used to find if product already exists before creating new one
 */
export async function searchProducts(params: {
  name?: string;
  brandName?: string;
  upc?: string;
  limit?: number;
}): Promise<{ data: ProductSearchResult[] | null; error: string | null }> {
  try {
    const { name, brandName, upc, limit = 10 } = params;
    const results: ProductSearchResult[] = [];

    // Search by UPC first (most accurate)
    if (upc) {
      // Search Prototypes by UPC
      const { data: prototypes, error: protoError } = await supabase
        .from('Prototype')
        .select('*, brand:brandId (*)')
        .eq('upc', upc)
        .eq('isActive', true)
        .limit(limit);

      if (!protoError && prototypes) {
        prototypes.forEach((p: any) => {
          results.push({ type: 'prototype', product: p, similarity: 100 });
        });
      }

      // Search CommunityProducts by UPC
      const { data: communityProducts, error: commError } = await supabase
        .from('CommunityProduct')
        .select('*')
        .eq('upc', upc)
        .in('status', ['ACTIVE', 'UNDER_REVIEW'])
        .limit(limit);

      if (!commError && communityProducts) {
        communityProducts.forEach((cp: any) => {
          results.push({ type: 'community', product: cp, similarity: 100 });
        });
      }
    }

    // Search by name and brand (fuzzy search)
    if (name && brandName && results.length === 0) {
      const normalizedBrand = brandName.toLowerCase().trim();

      // Search Prototypes
      const { data: prototypes, error: protoError } = await supabase
        .from('Prototype')
        .select('*, brand:brandId (*)')
        .ilike('name', `%${name}%`)
        .eq('isActive', true)
        .limit(limit);

      if (!protoError && prototypes) {
        prototypes.forEach((p: any) => {
          const brandMatch = p.brand?.name?.toLowerCase().trim() === normalizedBrand;
          const similarity = brandMatch ? 90 : 70;
          results.push({ type: 'prototype', product: p, similarity });
        });
      }

      // Search CommunityProducts
      const { data: communityProducts, error: commError } = await supabase
        .from('CommunityProduct')
        .select('*')
        .ilike('name', `%${name}%`)
        .ilike('brandName', `%${brandName}%`)
        .in('status', ['ACTIVE', 'UNDER_REVIEW'])
        .limit(limit);

      if (!commError && communityProducts) {
        communityProducts.forEach((cp: any) => {
          const exactMatch = cp.name.toLowerCase() === name.toLowerCase() && 
                           cp.brandName.toLowerCase() === normalizedBrand;
          const similarity = exactMatch ? 90 : 70;
          results.push({ type: 'community', product: cp, similarity });
        });
      }
    }

    // Sort by similarity (highest first)
    results.sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

    return { data: results.slice(0, limit), error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to search products' };
  }
}

/**
 * Create item ownership via Edge Function
 * This calls the create-item-ownership edge function which handles:
 * - Product search
 * - CommunityProduct creation if needed
 * - Ownership creation
 * - Image upload
 */
export async function createItemOwnership(
  payload: CreateItemPayload,
  userId: string
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    // Call the edge function
    const { data, error } = await supabase.functions.invoke('create-item-ownership', {
      body: {
        ...payload,
        ownerId: userId,
      },
    });

    if (error) throw error;
    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to create ownership');
    }

    return { data: data.ownership as Ownership, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to create item ownership' };
  }
}

/**
 * Get ownership by ID with full product details
 */
export async function getOwnershipById(
  ownershipId: string
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select(
        `
        *,
        prototype:prototypeId (
          *,
          brand:brandId (*)
        ),
        communityProduct:communityProductId (*)
      `
      )
      .eq('id', ownershipId)
      .single();

    if (error) throw error;
    return { data: data as Ownership, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch ownership' };
  }
}

/**
 * Get user's ownerships with pagination
 */
export async function getUserOwnerships(
  userId: string,
  limit = 20,
  offset = 0
): Promise<{ data: Ownership[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select(
        `
        *,
        prototype:prototypeId (
          *,
          brand:brandId (*)
        ),
        communityProduct:communityProductId (*)
      `
      )
      .eq('ownerId', userId)
      .eq('status', 'owned')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data as Ownership[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch ownerships' };
  }
}

/**
 * Update ownership (e.g., notes, condition, price)
 */
export async function updateOwnership(
  ownershipId: string,
  updates: Partial<Ownership>
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .update(updates)
      .eq('id', ownershipId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as Ownership, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to update ownership' };
  }
}

/**
 * Search for brands (for autocomplete)
 */
export async function searchBrands(query: string, limit = 20): Promise<{ data: Brand[] | null; error: string | null }> {
  try {
    if (!query || query.length < 2) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('Brand')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('verified', { ascending: false })
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { data: data as Brand[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to search brands' };
  }
}

/**
 * Get all brands (for dropdown)
 */
export async function getAllBrands(limit = 100): Promise<{ data: Brand[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Brand')
      .select('*')
      .order('verified', { ascending: false })
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { data: data as Brand[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch brands' };
  }
}

/**
 * Poll ownership processing status
 * Used to check if image processing is complete
 */
export async function checkProcessingStatus(
  ownershipId: string
): Promise<{ data: { processingStatus: string; processedImageUrl?: string } | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select('processingStatus, processedImageUrl, thumbnailUrl')
      .eq('id', ownershipId)
      .single();

    if (error) throw error;
    return {
      data: {
        processingStatus: data.processingStatus,
        processedImageUrl: data.processedImageUrl,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to check processing status' };
  }
}
