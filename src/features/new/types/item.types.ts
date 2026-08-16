// Types for item upload and ownership

export interface CreateItemPayload {
  name: string;
  upc?: string;
  notes?: string;
  brandName: string;
  category?: string;
  imageUri?: string; // Local file URI from image picker
  condition?: string;
  description?: string;
  purchaseDate?: string;
  purchasePrice?: number;
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
  upc?: string;
  brandName: string;
  category?: string;
  imageUrl?: string;
  createdBy: string;
  flagCount: number;
  createdAt: string;
  updatedAt: string;
  description?: string;
  thumbnailUrl?: string;
  ownershipCount: number;
  migratedToPrototypeId?: string;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'MIGRATED' | 'DELETED';
}

export interface Prototype {
  id: string;
  name: string;
  sku?: string;
  upc?: string;
  variants?: any;
  brandId: string;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  verifiedAt: string;
  isVerified: boolean;
  verifiedBy?: string;
  description?: string;
  retailPrice?: number;
  thumbnailUrl?: string;
  brand?: {
    id: string;
    name: string;
    logoUrl?: string;
    type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
  };
}

export interface Ownership {
  id: string;
  notes?: string;
  ownerId: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  condition?: string;
  prototypeId?: string;
  ownershipChain?: any;
  thumbnailUrl?: string;
  purchaseDate?: string;
  selectedVariant?: any;
  serialNumber?: string;
  transferable: boolean;
  prototype?: Prototype;
  purchasePrice?: number;
  isAuthenticated: boolean;
  originalImageUrl?: string;
  processedImageUrl?: string;
  communityProductId?: string;
  communityProduct?: CommunityProduct;
  status: 'owned' | 'sold' | 'donated' | 'wishlisted';
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  description?: string;
  type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
}

export interface ProductSearchResult {
  similarity?: number;
  type: 'prototype' | 'community';
  product: Prototype | CommunityProduct;
}

export interface CreateCommunityProductPayload {
  name: string;
  upc?: string;
  brandName: string;
  category?: string;
  imageUri?: string;
  condition?: string;
  description?: string;
  processImage?: boolean;
}
