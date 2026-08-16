export interface Brand {
  id: string;
  name: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  logoUrl: string | null;
  description: string | null;
  type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';

  // Application fields
  website: string | null;
  appliedAt: string | null;
  instagram: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  contactEmail: string | null;
  rejectionReason: string | null;
  applicationReason: string | null;
  applicationStatus: 'pending' | 'approved' | 'rejected';

  // Follow system
  followersCount: number;

  // Transfer quota
  transferQuota: number;
  transfersUsed: number;
  contractTier: string | null;
  contractEndDate: string | null;
  contractStartDate: string | null;
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
  logoUri?: string;
  website?: string;
  brandName: string;
  description: string;
  contactEmail: string;
  applicationReason: string;
  instagram?: string | undefined;
  brandType: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
}

export interface UserBrandStatus {
  isAdmin: boolean;
  hasBrand: boolean;
  brand: Brand | null;
  role: 'owner' | 'admin' | 'manager' | null;
}
