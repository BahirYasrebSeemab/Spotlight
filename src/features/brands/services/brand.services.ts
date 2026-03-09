import { supabase } from '@/src/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import type {
  Brand,
  BrandProfile,
  BrandFollower,
  BrandApplication,
  UserBrandStatus,
} from '@/src/features/brands/types/brand.types';

// ============================================
// EXISTING FUNCTIONS (keep these)
// ============================================

export async function searchBrands(query: string, limit = 20) {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('Brand')
      .select('id, name, description, logoUrl, verified, type')
      .ilike('name', `%${query}%`)
      .eq('verified', true)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return { data: data as Brand[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to search brands' };
  }
}

export async function getBrandById(brandId: string) {
  try {
    const { data, error } = await supabase
      .from('Brand')
      .select('id, name, description, logoUrl, verified, type')
      .eq('id', brandId)
      .single();

    if (error) throw error;
    return { data: data as Brand, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch brand' };
  }
}

// ============================================
// NEW FUNCTIONS - Brand Application
// ============================================

/**
 * Upload brand logo to Supabase Storage
 */
export async function uploadBrandLogo(userId: string, uri: string): Promise<string> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const bytes = Buffer.from(base64, 'base64');
    const ext = uri.split('.').pop() ?? 'jpg';
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage.from('brand-logos').upload(filePath, bytes, {
      contentType: `image/${ext}`,
      upsert: true,
    });

    if (uploadError) throw new Error(uploadError.message);

    // Get public URL
    const { data } = supabase.storage.from('brand-logos').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: any) {
    console.error('uploadBrandLogo error:', err);
    throw new Error('Failed to upload brand logo');
  }
}

/**
 * Submit brand application
 */
export async function submitBrandApplication(userId: string, application: BrandApplication) {
  try {
    let logoUrl: string | null = null;

    // Upload logo if provided
    if (application.logoUri) {
      logoUrl = await uploadBrandLogo(userId, application.logoUri);
    }

    // Create brand record
    const { data: brand, error: brandError } = await supabase
      .from('Brand')
      .insert({
        name: application.brandName,
        type: application.brandType,
        description: application.description,
        logoUrl,
        website: application.website,
        instagram: application.instagram,
        contactEmail: application.contactEmail,
        applicationReason: application.applicationReason,
        applicationStatus: 'pending',
        appliedAt: new Date().toISOString(),
        verified: false,
      })
      .select()
      .single();

    if (brandError) throw brandError;

    // Create brand admin record (user becomes owner)
    const { error: adminError } = await supabase.from('BrandAdmin').insert({
      userId,
      brandId: brand.id,
      role: 'owner',
    });

    if (adminError) throw adminError;

    return { data: brand as Brand, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to submit application' };
  }
}

/**
 * Get user's brand status (check if they own/admin a brand)
 */
export async function getUserBrand(userId: string) {
  try {
    const { data: brandAdmin, error } = await supabase
      .from('BrandAdmin')
      .select(
        `
        role,
        brand:brandId (*)
      `,
      )
      .eq('userId', userId)
      .single();

    if (error) {
      // User has no brand
      if (error.code === 'PGRST116') {
        return {
          data: {
            hasBrand: false,
            brand: null,
            isAdmin: false,
            role: null,
          } as UserBrandStatus,
          error: null,
        };
      }
      throw error;
    }

    return {
      data: {
        hasBrand: true,
        brand: brandAdmin.brand as unknown as Brand,
        isAdmin: true,
        role: brandAdmin.role as 'owner' | 'admin' | 'manager',
      } as UserBrandStatus,
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch user brand' };
  }
}

// ============================================
// NEW FUNCTIONS - Brand Profile
// ============================================

/**
 * Get full brand profile with stats
 */
export async function getBrandProfile(brandId: string, currentUserId?: string) {
  try {
    const { data: brand, error: brandError } = await supabase.from('Brand').select('*').eq('id', brandId).single();

    if (brandError) throw brandError;

    // Get products count
    const { count: productsCount } = await supabase
      .from('Prototype')
      .select('id', { count: 'exact', head: true })
      .eq('brandId', brandId)
      .eq('isActive', true);

    // Check if current user follows this brand
    let isFollowing = false;
    if (currentUserId) {
      const { data: followData } = await supabase
        .from('BrandFollower')
        .select('id')
        .eq('userId', currentUserId)
        .eq('brandId', brandId)
        .single();

      isFollowing = !!followData;
    }

    return {
      data: {
        ...brand,
        productsCount: productsCount || 0,
        isFollowing,
      } as BrandProfile,
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch brand profile' };
  }
}

/**
 * Get brand products (prototypes)
 */
export async function getBrandProducts(brandId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Prototype')
      .select('*')
      .eq('brandId', brandId)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const mapped = (data || []).map(item => ({
      ...item,
      type: 'PROTOTYPE' as const,
      verified: item.isVerified ?? false,
      ownershipCount: 0,
      brandName: item.brandName ?? '',
    }));

    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch brand products' };
  }
}

// ============================================
// NEW FUNCTIONS - Brand Follow System
// ============================================

export async function followBrand(userId: string, brandId: string) {
  try {
    const { error } = await supabase.from('BrandFollower').insert({ userId, brandId });
    if (error) throw error;
    await supabase.rpc('increment_brand_followers', { brand_id: brandId });
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to follow brand' };
  }
}

export async function unfollowBrand(userId: string, brandId: string) {
  try {
    const { error } = await supabase.from('BrandFollower').delete().eq('userId', userId).eq('brandId', brandId);
    if (error) throw error;
    await supabase.rpc('decrement_brand_followers', { brand_id: brandId });
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to unfollow brand' };
  }
}

/**
 * Check if user follows brand
 */
export async function checkBrandFollowStatus(userId: string, brandId: string) {
  try {
    const { data, error } = await supabase
      .from('BrandFollower')
      .select('id')
      .eq('userId', userId)
      .eq('brandId', brandId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      data: { isFollowing: !!data },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to check follow status' };
  }
}

/**
 * Get brand followers list
 */
/**
 * Get brand followers list
 */
export async function getBrandFollowers(brandId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('BrandFollower')
      .select(
        `
        id,
        userId,
        brandId,
        createdAt,
        user:userId (
          id,
          username,
          name,
          avatarUrl
        )
      `,
      )
      .eq('brandId', brandId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    // Transform the data to match BrandFollower type
    const transformedData = data?.map(follower => ({
      ...follower,
      user: Array.isArray(follower.user) ? follower.user[0] : follower.user,
    }));

    return { data: transformedData as BrandFollower[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch followers' };
  }
}

/**
 * Check if user is brand admin
 */
export async function checkBrandAdminStatus(userId: string, brandId: string) {
  try {
    const { data, error } = await supabase
      .from('BrandAdmin')
      .select('role')
      .eq('userId', userId)
      .eq('brandId', brandId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      data: {
        isAdmin: !!data,
        role: data?.role || null,
      },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to check admin status' };
  }
}
