// app/(app)/splash.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { setUser, setLoading } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { useAppDispatch } from '@/src/shared/hooks/redux';

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🚀 Splash: Checking auth...');

      try {
        dispatch(setLoading(true));

        // Get the session
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          console.log('✅ Splash: Session found! Loading user...');

          // Set user in Redux (this sets isAuthenticated = true)
          dispatch(setUser(data.session.user));

          // Fetch full user profile
          await dispatch(fetchUser(data.session.user.id));

          console.log('➡️ Splash: Redirecting to tabs...');
          router.replace('/(tabs)');
        } else {
          console.log('❌ Splash: No session found');
          dispatch(setUser(null));

          console.log('➡️ Splash: Redirecting to auth...');
          router.replace('/(auth)');
        }
      } catch (err) {
        console.error('❌ Splash error:', err);
        dispatch(setUser(null));
        router.replace('/(auth)');
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}
