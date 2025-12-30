import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { signInWithGoogle } from '../services/authServices';
import { setUser, setError } from '@/src/features/auth/slices/authSlice';
import { useRouter } from 'expo-router';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { supabase } from '@/src/lib/supabase';
import * as Linking from 'expo-linking';

export function useOAuth() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      dispatch(setError(null));
      setLocalError(null);

      // Start OAuth flow
      const { data, error } = await signInWithGoogle();

      if (error) throw new Error(error);

      // The actual session handling happens in handleDeepLink
      // when the app receives the redirect
      console.log('🚀 OAuth flow initiated');
    } catch (err: any) {
      const msg = err.message || 'Google OAuth failed';
      dispatch(setError(msg));
      setLocalError(msg);
      console.error('❌ OAuth error:', msg);
      setLoading(false);
    }
    // Don't setLoading(false) here - let handleDeepLink do it
  };

  return { handleGoogleLogin, loading, localError };
}
