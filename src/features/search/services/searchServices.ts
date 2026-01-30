// src/features/search/services/searchServices.ts
import { supabase } from '@/src/lib/supabase';

export interface SearchResult {
  id: string;
  name: string;
  type: 'USER' | 'PROTOTYPE' | 'COMMUNITY' | 'BRAND';
  subtitle: string;
  imageUrl: string | null;
  verified: boolean;
  extra: {
    // User fields
    username?: string;
    bio?: string;
    followersCount?: number;
    // Product fields
    brandName?: string;
    brandId?: string;
    category?: string;
    retailPrice?: number;
    ownershipCount?: number;
    upc?: string;
    // Brand fields
    description?: string;
    type?: string;
  };
}

export async function searchAll(query: string, limit = 20) {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase.rpc('search_all', {
      search_query: query,
      limit_count: limit,
    });

    if (error) throw error;
    return { data: data as SearchResult[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to search' };
  }
}

// Legacy function - keep for backward compatibility if needed
export async function searchUsers(query: string, limit = 20) {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('User')
      .select('id, username, name, avatarUrl, bio, followersCount')
      .or(`username.ilike.%${query}%,name.ilike.%${query}%`)
      .order('followersCount', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to search users' };
  }
}
