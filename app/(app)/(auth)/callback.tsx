// app/(app)/(auth)/callback.tsx
import { useEffect, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { setUser, setPasswordResetSession, setLoading } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import CustomSplashScreen from '@/src/shared/components/CustomSplashScreen';

export default function AuthCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const initialize = async () => {
      dispatch(setLoading(true));
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          const user = data.session.user;
          const isRecovery = user.recovery_sent_at !== undefined;

          if (isRecovery) {
            await supabase.auth.signOut();
            dispatch(setUser(null));
            router.replace('/(auth)');
          } else {
            dispatch(setUser(user));
            await dispatch(fetchUser(user.id)).unwrap();
            router.replace('/(tabs)');
          }
        } else {
          dispatch(setUser(null));
          router.replace('/(auth)');
        }
      } catch (err) {
        console.error('❌ Callback error:', err);
        dispatch(setUser(null));
        router.replace('/(auth)');
      } finally {
        dispatch(setLoading(false));
      }
    };

    initialize();
  }, [dispatch, router]);

  return <Redirect href="/(tabs)" />;
}
