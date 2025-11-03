// src/features/auth/hooks/useGlobalAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase'
import { useDispatch } from 'react-redux';
import { setUser } from '../../features/auth/slices/authSlice';

export function useGlobalAuth() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        dispatch(setUser(session.user));
        router.replace('/(tabs)');
      } else {
        dispatch(setUser(null));
        router.replace('/(auth)');
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        dispatch(setUser(session.user));
        router.replace('/(tabs)');
      } else {
        dispatch(setUser(null));
        router.replace('/(auth)');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);
}
