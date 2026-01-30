// src/features/products/types/product.types.ts

export type ProductType = 'PROTOTYPE' | 'COMMUNITY';

export interface Product {
  id: string;
  name: string;
  brandName: string;
  brandId: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  upc: string | null;
  category: string | null;
  retailPrice: number | null;
  type: ProductType;
  verified: boolean;
  ownershipCount: number;
  relevance?: number;
}

export interface ProductDetail extends Product {
  description?: string | null;
  sku?: string | null;
  variants?: any;
  // For Prototype
  isActive?: boolean;
  // For CommunityProduct
  createdBy?: string;
  status?: string;
}

export type ProductCategory = 'All' | 'Footwear' | 'Apparel' | 'Accessories';
