import { useState } from 'react';
import {useAppDispatch} from '@/src/shared/hooks/redux'
import { signInWithGoogle } from '../services/authServices';
import { setUser, setError } from '@/src/features/auth/slices/authSlice';
import { useRouter } from 'expo-router';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { supabase } from '@/src/lib/supabase';

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

      // 1️⃣ OAuth
      const { data, error } = await signInWithGoogle();
      if (error) throw new Error(error);
      if (!data?.url) throw new Error('No OAuth URL');

      // 2️⃣ Extract tokens from URL hash
      const hash = data.url.split('#')[1];
      if (!hash) throw new Error('No hash in OAuth URL');

      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');
      if (!access_token || !refresh_token) throw new Error('Missing tokens');

      // 3️⃣ Create Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });
      if (sessionError || !sessionData?.session) throw sessionError ?? new Error('Session failed');

      // 4️⃣ Sync Redux
      const user = sessionData.session.user;
      dispatch(setUser(user));
      await dispatch(fetchUser(user.id));

      // 5️⃣ Redirect to tabs
      router.replace('/(tabs)');

      console.log('Google OAuth success ✅');
    } catch (err: any) {
      const msg = err.message || 'Google OAuth failed';
      dispatch(setError(msg));
      setLocalError(msg);
      console.error('OAuth error:', msg);
    } finally {
      setLoading(false);
    }
  };


  return { handleGoogleLogin, loading, localError };
}
