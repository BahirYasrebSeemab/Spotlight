import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { signInWithGoogle } from '../services/authServices';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { useLoadUser } from '@/src/features/user/hooks/useLoadUser';
import { supabase } from '@/src/lib/supabase';

export function useOAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { load } = useLoadUser();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Start OAuth
      const { data, error } = await signInWithGoogle();
      if (error) throw new Error(error);

      // OAuth success → Now pull user from Supabase
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('Failed to retrieve Supabase user');

      const user = userData.user;

      // Save in redux
      dispatch(setUser(user));

      // Check if user profile exists in your DB
      const profile = await load(user.id);

      if (!profile) {
        // No profile → go to onboarding
        router.replace('/onboarding/UsernameScreen');
      } else {
        // Profile exists → go to app
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('OAuth Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleLogin, loading };
}
