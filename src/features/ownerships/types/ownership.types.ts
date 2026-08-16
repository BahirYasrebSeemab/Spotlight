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
  notes?: string;
  purchaseDate?: string; // ISO date string
  purchasePrice?: number;
  condition?: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  selectedVariant?: {
    size?: string;
    color?: string;
    [key: string]: any;
  };

  // Auto-filled from source
  status?: 'owned' | 'sold' | 'gifted' | 'lost';
}

export interface Ownership {
  id: string;
  notes?: string;
  status: string;
  ownerId: string;
  flagged: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  condition?: string;
  transferId?: string;
  prototypeId?: string;
  purchaseDate?: string;
  selectedVariant?: any;
  purchasePrice?: number;
  verificationCode?: string;
  useOfficialImage: boolean;
  originalImageUrl?: string;
  communityProductId?: string;

  // Joined data
  prototype?: Prototype;
  communityProduct?: CommunityProduct;
}

export interface Prototype {
  id: string;
  name: string;
  upc?: string;
  brand?: Brand;
  variants?: any;
  brandId: string;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  description?: string;
}

export interface CommunityProduct {
  id: string;
  name: string;
  upc?: string;
  status: string;
  creatorId: string;
  brandName: string;
  imageUrl?: string;
  category?: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  verified: boolean;
}
