export interface User {
  id: string;
  fullName?: string;
  username?: string;
  email: string;
  avatar?: string;
  dob?: string;
  isBrand?: boolean;
  createdAt: string;
  onboardingComplete?: boolean;
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
  username: string;
  name: string | null;
  avatarUrl: string | null;
  dob?: string | null;
  bio?: string | null;
}

export interface SupabaseAuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
  };
}
