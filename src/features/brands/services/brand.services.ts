// src/features/brands/services/brand.services.ts
import { supabase } from '@/src/lib/supabase';
import type { Brand } from '../types/brand.types';

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
