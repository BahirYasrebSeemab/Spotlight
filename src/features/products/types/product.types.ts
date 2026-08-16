// src/features/products/types/product.types.ts

export type ProductType = 'PROTOTYPE' | 'COMMUNITY';

export interface Product {
  id: string;
  name: string;
  brandName: string;
  type: ProductType;
  verified: boolean;
  upc: string | null;
  relevance?: number;
  brandId: string | null;
  ownershipCount: number;
  imageUrl: string | null;
  category: string | null;
  retailPrice: number | null;
  thumbnailUrl: string | null;
}

export interface ProductDetail extends Product {
  variants?: any;
  sku?: string | null;
  description?: string | null;
  // For Prototype
  isActive?: boolean;
  // For CommunityProduct
  status?: string;
  createdBy?: string;
}

export type ProductCategory = 'All' | 'Footwear' | 'Apparel' | 'Accessories';
