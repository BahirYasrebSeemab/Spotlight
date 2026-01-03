// src/features/search/services/search.service.ts
import { supabase } from '@/src/lib/supabase';

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
