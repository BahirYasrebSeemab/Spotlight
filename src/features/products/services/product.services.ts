// src/features/products/services/product.services.ts
import { supabase } from '@/src/lib/supabase';
import type { Product, ProductDetail } from '../types/product.types';

export async function searchProducts(query: string, limit = 20) {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase.rpc('search_products', {
      search_query: query,
      limit_count: limit,
    });

    if (error) throw error;
    return { data: data as Product[], error: null };
  } catch (err: any) {
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
        id: data.id,
        name: data.name,
        description: data.description,
        brandName: (data.brand as any)?.name || 'Unknown',
        brandId: data.brandId,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        upc: data.upc,
        sku: data.sku,
        category: data.category,
        retailPrice: data.retailPrice ? parseFloat(data.retailPrice as any) : null,
        type: 'PROTOTYPE',
        verified: true,
        ownershipCount: 0, // Will be fetched separately if needed
        variants: data.variants,
        isActive: data.isActive,
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
        id: data.id,
        name: data.name,
        description: data.description,
        brandName: data.brandName,
        brandId: null,
        imageUrl: data.imageUrl,
        thumbnailUrl: data.thumbnailUrl,
        upc: data.upc,
        category: data.category,
        retailPrice: null,
        type: 'COMMUNITY',
        verified: false,
        ownershipCount: data.ownershipCount || 0,
        status: data.status,
        createdBy: data.createdBy,
      };

      return { data: productDetail, error: null };
    }
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch product' };
  }
}
