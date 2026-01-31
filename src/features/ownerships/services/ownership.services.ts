// ========================================
// src/features/ownership/services/ownership.services.ts
// Supabase calls for ownership operations
// ========================================
import { supabase } from '@/src/lib/supabase';
import { CreateOwnershipPayload, Ownership } from '../types/ownership.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

/**
 * Create ownership via Edge Function
 * This handles both prototype-based and community product-based ownerships
 */
export async function createOwnership(
  payload: CreateOwnershipPayload,
): Promise<{ data: Ownership | null; error: string | null }> {
  try {
    // Validate: must have either prototypeId or communityProductId
    if (!payload.prototypeId && !payload.communityProductId) {
      throw new Error('Must provide either prototypeId or communityProductId');
    }

    if (payload.prototypeId && payload.communityProductId) {
      throw new Error('Cannot provide both prototypeId and communityProductId');
    }

    // Get the current session token
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error('No active session');

    const formData = new FormData();

    // Add product reference
    if (payload.prototypeId) formData.append('prototypeId', payload.prototypeId);
    if (payload.communityProductId) formData.append('communityProductId', payload.communityProductId);

    // Add image settings
    formData.append('useOfficialImage', payload.useOfficialImage.toString());

    // If user wants to use their own photo, handle image upload
    if (!payload.useOfficialImage && payload.originalImageUrl) {
      try {
        const imageResponse = await fetch(payload.originalImageUrl);
        if (!imageResponse.ok) {
          throw new Error('Failed to fetch image from URI');
        }

        const blob = await imageResponse.blob();
        if (blob.size === 0) {
          throw new Error('Image file is empty');
        }

        // Get file extension
        let fileExtension = 'jpg';
        if (payload.originalImageUrl.includes('.')) {
          const uriParts = payload.originalImageUrl.split('.');
          fileExtension = uriParts[uriParts.length - 1].split('?')[0] || 'jpg';
        } else if (blob.type) {
          fileExtension = blob.type.split('/')[1] || 'jpg';
        }

        // React Native FormData format
        // @ts-ignore
        formData.append('image', {
          uri: payload.originalImageUrl,
          type: blob.type || 'image/jpeg',
          name: `item-photo.${fileExtension}`,
        });
      } catch (imageError: any) {
        throw new Error(`Failed to process image: ${imageError.message}`);
      }
    }

    // Add optional fields
    if (payload.condition) formData.append('condition', payload.condition);
    if (payload.purchaseDate) formData.append('purchaseDate', payload.purchaseDate);
    if (payload.purchasePrice) formData.append('purchasePrice', payload.purchasePrice.toString());
    if (payload.selectedVariant) formData.append('selectedVariant', JSON.stringify(payload.selectedVariant));
    if (payload.notes) formData.append('notes', payload.notes);
    if (payload.status) formData.append('status', payload.status);

    // Call edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-ownership`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Edge function failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data || !data.success) {
      throw new Error(data?.error || 'Failed to create ownership');
    }

    return { data: data.ownership as Ownership, error: null };
  } catch (err: any) {
    console.error('Create ownership error:', err);
    return {
      data: null,
      error: err.message || 'Failed to create ownership',
    };
  }
}

/**
 * Get ownership details with product info
 */
export async function getOwnership(ownershipId: string): Promise<{ data: Ownership | null; error: string | null }> {
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
      .eq('id', ownershipId)
      .single();

    if (error) throw error;
    return { data: data as Ownership, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch ownership' };
  }
}

/**
 * Update ownership
 */
export async function updateOwnership(
  ownershipId: string,
  updates: Partial<CreateOwnershipPayload>,
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
 * Delete ownership
 */
export async function deleteOwnership(ownershipId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.from('Ownership').delete().eq('id', ownershipId);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete ownership' };
  }
}
