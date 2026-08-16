// src/features/products/services/product.services.ts
import { supabase } from '@/src/lib/supabase';

import type { Product, ProductDetail } from '../types/product.types';

export async function searchProducts(query: string, limit = 20) {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase.rpc('search_products', {
      limit_count: limit,
      search_query: query,
    });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    return { data: data as Product[], error: null };
  } catch (err: any) {
    console.error('💥 Exception caught:', err);
    return { data: null, error: err.message || 'Failed to search products' };
  }
}

export async function getProductById(productId: string, type: 'PROTOTYPE' | 'COMMUNITY') {
  try {
    if (type === 'PROTOTYPE') {
      const { data, error } = await supabase
        .from('Prototype')
        .select(
          `
          id,
          name,
          description,
          sku,
          upc,
          category,
          retailPrice,
          imageUrl,
          thumbnailUrl,
          variants,
          isActive,
          brandId,
          brand:Brand(id, name, logoUrl, verified)
        `,
        )
        .eq('id', productId)
        .single();

      if (error) throw error;

      const productDetail: ProductDetail = {
        brandId: data.brandId,
        brandName: (data.brand as any)?.name || 'Unknown',
        category: data.category,
        description: data.description,
        id: data.id,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        name: data.name,
        ownershipCount: 0, // Will be fetched separately if needed
        retailPrice: data.retailPrice ? parseFloat(data.retailPrice as any) : null,
        sku: data.sku,
        thumbnailUrl: data.thumbnailUrl,
        type: 'PROTOTYPE',
        upc: data.upc,
        variants: data.variants,
        verified: true,
      };

      return { data: productDetail, error: null };
    } else {
      const { data, error } = await supabase
        .from('CommunityProduct')
        .select(
          `
          id,
          name,
          description,
          brandName,
          upc,
          category,
          imageUrl,
          thumbnailUrl,
          ownershipCount,
          status,
          createdBy
        `,
        )
        .eq('id', productId)
        .single();

      if (error) throw error;

      const productDetail: ProductDetail = {
        brandId: null,
        brandName: data.brandName,
        category: data.category,
        createdBy: data.createdBy,
        description: data.description,
        id: data.id,
        imageUrl: data.imageUrl,
        name: data.name,
        ownershipCount: data.ownershipCount || 0,
        retailPrice: null,
        status: data.status,
        thumbnailUrl: data.thumbnailUrl,
        type: 'COMMUNITY',
        upc: data.upc,
        verified: false,
      };

      return { data: productDetail, error: null };
    }
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch product' };
  }
}
