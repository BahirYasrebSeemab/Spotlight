// src/features/closet/types/closet.types.ts

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  verified: boolean;
  type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
}

export interface Prototype {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sku?: string;
  upc?: string;
  retailPrice?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  brand: Brand;
}

export interface CommunityProduct {
  id: string;
  name: string;
  brandName: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
}

export interface Ownership {
  id: string;
  ownerId: string;
  prototypeId?: string;
  communityProductId?: string;
  status: string;
  verified: boolean;
  condition?: string;
  notes?: string;
  originalImageUrl?: string;
  processedImageUrl?: string;
  thumbnailUrl?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  purchasePrice?: number;
  purchaseDate?: string;
  serialNumber?: string;
  isAuthenticated: boolean;
  transferable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OwnershipWithProduct extends Ownership {
  communityProduct?: CommunityProduct;
  prototype?: Prototype;
}

export interface ClosetFilters {
  category?: string;
  brand?: string;
  verified?: boolean;
  status?: string;
}

export interface ClosetStats {
  totalItems: number;
  verifiedItems: number;
  categories: Record<string, number>;
  brands: Record<string, number>;
}
