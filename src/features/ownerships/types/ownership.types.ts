// ========================================
// src/features/ownership/types/ownership.types.ts
// Types for ownership creation and management
// ========================================

export interface CreateOwnershipPayload {
  // Product Reference (ONE of these must be provided)
  prototypeId?: string;
  communityProductId?: string;

  // Image Options
  useOfficialImage: boolean; // true = use brand/community photo, false = use own
  originalImageUrl?: string; // User's own photo (if useOfficialImage = false)

  // Item Details
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  purchaseDate?: string; // ISO date string
  purchasePrice?: number;
  selectedVariant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };
  notes?: string;

  // Auto-filled from source
  status?: 'owned' | 'sold' | 'gifted' | 'lost';
}

export interface Ownership {
  id: string;
  ownerId: string;
  prototypeId?: string;
  communityProductId?: string;
  verified: boolean;
  verificationCode?: string;
  transferId?: string;
  useOfficialImage: boolean;
  originalImageUrl?: string;
  condition?: string;
  notes?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  selectedVariant?: any;
  status: string;
  flagged: boolean;
  createdAt: string;
  updatedAt: string;

  // Joined data
  prototype?: Prototype;
  communityProduct?: CommunityProduct;
}

export interface Prototype {
  id: string;
  brandId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  variants?: any;
  upc?: string;
  isActive: boolean;
  brand?: Brand;
}

export interface CommunityProduct {
  id: string;
  creatorId: string;
  name: string;
  brandName: string;
  imageUrl?: string;
  category?: string;
  description?: string;
  upc?: string;
  status: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
}
