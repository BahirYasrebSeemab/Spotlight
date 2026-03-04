// ========================================
// src/features/ownership/services/ownership.services.ts
// FIXED: Properly sends processImage parameter
// ========================================
import { supabase } from '@/src/lib/supabase';
import { CreateOwnershipPayload, Ownership } from '../types/ownership.types';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;

/**
 * Create ownership via Edge Function
 * This handles both prototype-based and community product-based ownerships
 */
export async function createOwnership(
  payload: CreateOwnershipPayload & { processImage?: boolean }, // ← ADDED processImage type
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

    // ← ADDED: Add processImage flag BEFORE image
    if (payload.processImage !== undefined) {
      formData.append('processImage', payload.processImage.toString());
      console.log('✅ processImage set to:', payload.processImage);
    }

    // If user wants to use their own photo, handle image upload
    if (!payload.useOfficialImage && payload.originalImageUrl) {
      try {
        console.log('Processing custom image:', payload.originalImageUrl);

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
        // @ts-ignore - React Native specific FormData format
        formData.append('image', {
          uri: payload.originalImageUrl,
          type: blob.type || 'image/jpeg',
          name: `item-photo.${fileExtension}`,
        });

        console.log('Image added to FormData');
      } catch (imageError: any) {
        console.error('Image processing error:', imageError);
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

    console.log('Calling create-ownership edge function...');

    // Call edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/create-item-ownership`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        // CRITICAL: Don't set Content-Type - let fetch handle multipart/form-data boundary
      },
      body: formData,
    });

    console.log('Edge function response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', errorText);
      throw new Error(`Edge function failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Edge function response:', data);

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

// export async function createOwnership(payload: any) {
//   try {

//     // Validation
//     if (!payload.userId) {
//       throw new Error('User ID is required');
//     }

//     if (!payload.prototypeId && !payload.communityProductId && !payload.createNewCommunityProduct) {
//       throw new Error('Must provide either a prototype or community product, or create a new one');
//     }

//     let communityProductId = payload.communityProductId;

//     // If creating new community product
//     if (payload.createNewCommunityProduct) {
//       const { data: newProduct, error: productError } = await supabase
//         .from('CommunityProduct')
//         .insert({
//           name: payload.name,
//           brandName: payload.brandName,
//           category: payload.category,
//           upc: payload.upc,
//           description: payload.description,
//           createdBy: payload.userId,
//         })
//         .select()
//         .single();

//       if (productError) {
//         console.error('❌ Community product creation error:', productError);
//         throw productError;
//       }
//       communityProductId = newProduct.id;
//     }

//     // Create ownership data
//     const ownershipData: any = {
//       ownerId: payload.userId,
//       condition: payload.condition,
//       purchasePrice: payload.purchasePrice,
//       purchaseDate: payload.purchaseDate,
//       notes: payload.notes,
//       useOfficialImage: payload.useOfficialImage ?? true,
//       processingStatus: 'completed',
//       status: payload.status || 'owned',
//     };

//     // Handle image
//     if (!payload.useOfficialImage && payload.originalImageUrl) {
//       ownershipData.originalImageUrl = payload.originalImageUrl;
//       ownershipData.processingStatus = payload.processImage ? 'pending' : 'completed';
//     }

//     // Add selected variant
//     if (payload.selectedVariant) {
//       ownershipData.selectedVariant = payload.selectedVariant;
//     }

//     // Set either prototypeId or communityProductId
//     if (payload.prototypeId) {
//       ownershipData.prototypeId = payload.prototypeId;
//     } else if (communityProductId) {
//       ownershipData.communityProductId = communityProductId;
//     }


//     const { data: ownership, error: ownershipError } = await supabase
//       .from('Ownership')
//       .insert(ownershipData)
//       .select()
//       .single();

//     if (ownershipError) {
//       console.error('❌ Ownership creation error:', ownershipError);
//       throw ownershipError;
//     }

//     return { data: ownership, error: null };
//   } catch (err: any) {
//     console.error('💥 createOwnership error:', err);
//     return { data: null, error: err.message || 'Failed to create ownership' };
//   }
// }

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
 * Get ownership by ID with full details
 */
export async function getOwnershipById(ownershipId: string) {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select(
        `
        *,
        owner:ownerId (
          id,
          username,
          name,
          avatarUrl
        ),
        prototype:prototypeId (
          id,
          name,
          description,
          imageUrl,
          thumbnailUrl,
          category,
          retailPrice,
          sku,
          upc,
          brand:brandId (
            id,
            name,
            logoUrl,
            verified,
            type
          )
        ),
        communityProduct:communityProductId (
          id,
          name,
          brandName,
          description,
          imageUrl,
          thumbnailUrl,
          category
        )
      `
      )
      .eq('id', ownershipId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch ownership details' };
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
