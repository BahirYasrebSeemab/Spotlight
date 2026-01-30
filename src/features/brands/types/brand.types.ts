// src/features/brands/types/brand.types.ts
export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  verified: boolean;
  type: 'INTERNATIONAL' | 'LOCAL' | 'TAILORED';
}
