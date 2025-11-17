import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { signInWithGoogle } from '../services/authServices';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { createUser } from '@/src/features/user/services/userServices';
import { supabase } from '@/src/lib/supabase';

export function useOAuth() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // OAuth start
      const { data, error } = await signInWithGoogle();
      if (error) throw new Error(error);
      
      const session = await supabase.auth.getSession();
      console.log('SESSION:', session);

      // Get authenticated user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error('Failed to retrieve Supabase user');

      const authUser = userData.user;

      // Extract username from email (before @)
      const extractedUsername = authUser.email?.split('@')[0] || `user_${authUser.id.slice(0, 6)}`;

      // Build profile payload
      const profilePayload = {
        id: authUser.id,
        email: authUser.email!,
        username: extractedUsername,
        name: authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? null,
        avatarUrl: authUser.user_metadata?.avatar_url ?? null,
        dob: null, // Google doesn't give DOB
      };

      // Insert / upsert to User table
      const { data: profile, error: dbError } = await createUser(profilePayload);
      if (dbError) throw dbError;

      // Merge into Redux
      const combined = { ...authUser, profile };

      dispatch(setUser(combined));

      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('OAuth Error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleLogin, loading };
}
