// Types for item upload and ownership

export interface CreateItemPayload {
  name: string;
  brandName: string;
  upc?: string;
  category?: string;
  description?: string;
  imageUri?: string; // Local file URI from image picker
  condition?: string;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  existingPrototypeId?: string;
  existingCommunityProductId?: string;
  selectedVariant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
}

export interface CommunityProduct {
  id: string;
  name: string;
  brandName: string;
  description?: string;
  upc?: string;
  category?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  createdBy: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'MIGRATED' | 'DELETED';
  migratedToPrototypeId?: string;
  ownershipCount: number;
  flagCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Prototype {
  id: string;
  name: string;
  description?: string;
  brandId: string;
  sku?: string;
  upc?: string;
  category?: string;
  retailPrice?: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  variants?: any;
  isVerified: boolean;
  verifiedAt: string;
  verifiedBy?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
    logoUrl?: string;
    type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
  };
}

export interface Ownership {
  id: string;
  ownerId: string;
  prototypeId?: string;
  communityProductId?: string;
  status: 'owned' | 'sold' | 'donated' | 'wishlisted';
  verified: boolean;
  isAuthenticated: boolean;
  condition?: string;
  notes?: string;
  originalImageUrl?: string;
  processedImageUrl?: string;
  thumbnailUrl?: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  purchaseDate?: string;
  purchasePrice?: number;
  selectedVariant?: any;
  serialNumber?: string;
  transferable: boolean;
  ownershipChain?: any;
  createdAt: string;
  updatedAt: string;
  prototype?: Prototype;
  communityProduct?: CommunityProduct;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  verified: boolean;
  type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchResult {
  type: 'prototype' | 'community';
  product: Prototype | CommunityProduct;
  similarity?: number;
}
