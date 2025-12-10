import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/src/lib/supabase';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';

export default function OAuthCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const run = async () => {
      const url = await Linking.getInitialURL();
      console.log('Callback URL:', url);

      if (!url || !url.includes('code=')) {
        router.replace('/(auth)');
        return;
      }
      const { data, error } = await supabase.auth.exchangeCodeForSession(url);

      if (error) {
        console.log('OAuth error:', error);
        router.replace('/(auth)');
        return;
      }

      const session = data.session;
      dispatch(setUser(session.user));

      console.log('OAuth success → Redirecting');
      router.replace('/(tabs)');
    };

    run();
  }, []);

  return null;
}
