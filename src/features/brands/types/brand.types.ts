export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  verified: boolean;
  type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
  createdAt: string;
  updatedAt: string;
  
  // Application fields
  applicationStatus: 'pending' | 'approved' | 'rejected';
  appliedAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  rejectionReason: string | null;
  website: string | null;
  instagram: string | null;
  contactEmail: string | null;
  applicationReason: string | null;
  
  // Follow system
  followersCount: number;
  
  // Transfer quota
  transferQuota: number;
  transfersUsed: number;
  contractTier: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
}

export interface BrandProfile extends Brand {
  productsCount: number;
  isFollowing?: boolean;
}

export interface BrandFollower {
  id: string;
  userId: string;
  brandId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
}

export interface BrandApplication {
  brandName: string;
  brandType: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
  description: string;
  logoUri?: string;
  website?: string;
  instagram?: string;
  contactEmail: string;
  applicationReason: string;
}

export interface UserBrandStatus {
  hasBrand: boolean;
  brand: Brand | null;
  isAdmin: boolean;
  role: 'owner' | 'admin' | 'manager' | null;
}