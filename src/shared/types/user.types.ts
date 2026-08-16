export interface User {
  id: string;
  dob?: string;
  bio?: string;
  name?: string;
  email: string;
  username?: string;
  isBrand?: boolean;
  avatarUrl?: string;
  updatedAt?: string;
  createdAt?: string; // make optional
  followingCount?: number;
  followersCount?: number;
}
export interface UserProfilePayload {
  bio?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  bio?: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isPrivate?: boolean;
}

export interface UpdateUserPayload {
  bio?: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  isPrivate?: boolean;
}

export interface OnboardingData {
  dob?: string;
  avatar?: string;
  username?: string;
  fullName?: string;
}

export interface CreateUserPayload {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatarUrl?: string;
  dob?: string | null;
  bio?: string | null;
  provider?: string | null;
  lastLoginAt?: Date | null;
  email_confirmed_at?: any | null;
}
