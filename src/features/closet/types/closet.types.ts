// src/features/closet/types/closet.types.ts

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
  description?: string;
  type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
}

export interface Prototype {
  id: string;
  name: string;
  sku?: string;
  upc?: string;
  brand: Brand;
  category?: string;
  imageUrl?: string;
  description?: string;
  retailPrice?: number;
  thumbnailUrl?: string;
}

export interface CommunityProduct {
  id: string;
  name: string;
  brandName: string;
  category?: string;
  imageUrl?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface Ownership {
  id: string;
  status: string;
  notes?: string;
  ownerId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  condition?: string;
  prototypeId?: string;
  thumbnailUrl?: string;
  purchaseDate?: string;
  serialNumber?: string;
  transferable: boolean;
  purchasePrice?: number;
  isAuthenticated: boolean;
  originalImageUrl?: string;
  processedImageUrl?: string;
  thumbnailImageUrl?: string;
  communityProductId?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface OwnershipWithProduct extends Ownership {
  prototype?: Prototype;
  communityProduct?: CommunityProduct;
}

export interface ClosetFilters {
  brand?: string;
  status?: string;
  category?: string;
  verified?: boolean;
}

export interface ClosetStats {
  totalItems: number;
  verifiedItems: number;
  brands: Record<string, number>;
  categories: Record<string, number>;
}
