// ========================================
// src/features/new/newServices/item.services.ts
// Centralized Supabase calls for item/ownership operations
// ========================================
import { supabase } from '@/src/lib/supabase';

import { CreateItemPayload, Ownership, Brand, ProductSearchResult } from '../types/item.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

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
    const { brandName, limit = 10, name, upc } = params;
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
          results.push({ product: p, similarity: 100, type: 'prototype' });
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
          results.push({ product: cp, similarity: 100, type: 'community' });
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
          results.push({ product: p, similarity, type: 'prototype' });
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
          const exactMatch =
            cp.name.toLowerCase() === name.toLowerCase() && cp.brandName.toLowerCase() === normalizedBrand;
          const similarity = exactMatch ? 90 : 70;
          results.push({ product: cp, similarity, type: 'community' });
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
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    const formData = new FormData();

    // Add all the text fields
    formData.append('name', payload.name);
    formData.append('brandName', payload.brandName);

    if (payload.upc) formData.append('upc', payload.upc);
    if (payload.category) formData.append('category', payload.category);
    if (payload.description) formData.append('description', payload.description);
    if (payload.condition) formData.append('condition', payload.condition);
    if (payload.notes) formData.append('notes', payload.notes);
    if (payload.purchasePrice) formData.append('purchasePrice', payload.purchasePrice.toString());
    if (payload.purchaseDate) formData.append('purchaseDate', payload.purchaseDate.toString());

    // Add existing product IDs if selected
    if (payload.existingPrototypeId) formData.append('existingPrototypeId', payload.existingPrototypeId);
    if (payload.existingCommunityProductId)
      formData.append('existingCommunityProductId', payload.existingCommunityProductId);

    // Add the image file if it exists
    if (payload.imageUri) {
      try {
        // Fetch the image from the URI
        const imageResponse = await fetch(payload.imageUri);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image from URI');
        }

        const blob = await imageResponse.blob();

        if (blob.size === 0) {
          throw new Error('Image file is empty');
        }

        // Get file extension from URI or blob type
        let fileExtension = 'jpg';
        if (payload.imageUri.includes('.')) {
          const uriParts = payload.imageUri.split('.');
          fileExtension = uriParts[uriParts.length - 1].split('?')[0] || 'jpg';
        } else if (blob.type) {
          // Extract extension from MIME type (e.g., "image/jpeg" -> "jpeg")
          fileExtension = blob.type.split('/')[1] || 'jpg';
        }

        // CRITICAL: React Native FormData needs this specific format
        // @ts-ignore - React Native specific FormData format
        formData.append('image', {
          name: `photo.${fileExtension}`,
          type: blob.type || 'image/jpeg',
          uri: payload.imageUri,
        });
      } catch (imageError: string | any) {
        console.error('Error processing image:', imageError);
        throw new Error(`Failed to process image file: ${imageError.message}`);
      }
    } else {
      console.log('No image URI provided');
    }

    // Get the current session token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    // Use fetch directly - better FormData support in React Native
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-item-ownership`, {
      body: formData,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        // CRITICAL: Don't set Content-Type - let fetch handle multipart/form-data boundary
      },
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error response:', errorText);
      throw new Error(`Edge function failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data || !data.success) {
      throw new Error(data?.error || 'Failed to create ownership');
    }

    return { data: data.ownership as Ownership, error: null };
  } catch (err: any) {
    console.error('Create item ownership error:', err);
    return {
      data: null,
      error: err.message || 'Failed to create item ownership',
    };
  }
}
/**
 * Get user's ownerships with pagination
 */
export async function getUserOwnerships(
  userId: string,
  limit = 20,
  offset = 0,
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
      `,
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
  updates: Partial<Ownership>,
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    const { data, error } = await supabase.from('Ownership').update(updates).eq('id', ownershipId).select().single();

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
  ownershipId: string,
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select('id, processingStatus, originalImageUrl, processedImageUrl, thumbnailUrl')
      .eq('id', ownershipId)
      .single();

    if (error) throw error;
    return { data: data as Ownership, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to check processing status' };
  }
}
