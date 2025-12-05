export interface User {
  id: string;
  name?: string;
  username?: string;
  email: string;
  avatarUrl?: string;
  dob?: string;
  bio?: string;
  isBrand?: boolean;
  updatedAt?: string;
  createdAt?: string; // make optional
}
export interface UserProfilePayload {
  username?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserPayload {
  username?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface OnboardingData {
  username?: string;
  fullName?: string;
  avatar?: string;
  dob?: string;
}

export interface CreateUserPayload {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatarUrl?: string;
  dob?: string | null;
  bio?: string | null;
  provider?: string | null;
  lastLoginAt?: Date | null;
  email_confirmed_at?: any | null;
}
