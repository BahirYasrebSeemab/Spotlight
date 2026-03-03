// ========================================
// app/(app)/splash.tsx - NUKED THE RECOVERY SESSION LOGIC
// ========================================
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { setCurrentUser, setPasswordResetSession, clearCurrentUser } from '@/src/features/auth/slices/authSlice';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomSplashScreen from '@/src/shared/components/CustomSplashScreen';

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  useEffect(() => {
    const initialize = async () => {
      try {
        // Check for deep link first (password reset)
        const initialUrl = await Linking.getInitialURL();

        // Handle password reset link from cold start
        if (initialUrl && initialUrl.includes('type=recovery')) {

          let tokenHash = null;
          const queryMatch = initialUrl.match(/[?&]token_hash=([^&#]+)/);
          if (queryMatch) {
            tokenHash = queryMatch[1];
          } else {
            const hashIndex = initialUrl.indexOf('#');
            if (hashIndex !== -1) {
              const params = new URLSearchParams(initialUrl.substring(hashIndex + 1));
              tokenHash = params.get('token_hash');
            }
          }

          if (tokenHash) {
            try {
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery',
              });

              if (!error && data?.session) {
                dispatch(setPasswordResetSession(true));
                router.replace('/(auth)/reset-password');
                return; // Exit early
              }
            } catch (err) {
              console.error('❌ OTP verification error:', err);
            }
          }
        }

        // Handle OAuth callback from cold start
        if (initialUrl && initialUrl.includes('access_token') && initialUrl.includes('refresh_token')) {

          try {
            const hashIndex = initialUrl.indexOf('#');
            if (hashIndex !== -1) {
              const params = new URLSearchParams(initialUrl.substring(hashIndex + 1));
              const access_token = params.get('access_token');
              const refresh_token = params.get('refresh_token');

              if (access_token && refresh_token) {
                const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                  access_token,
                  refresh_token,
                });

                if (!sessionError && sessionData?.session) {
                  const user = sessionData.session.user;

                  // Set user in Redux
                  dispatch(setCurrentUser(user));

                  // Save to AsyncStorage
                  await AsyncStorage.setItem('authState', JSON.stringify({ user }));

                  // Prefetch user profile
                  await queryClient.prefetchQuery({
                    queryKey: ['user-profile', user.id],
                    queryFn: async () => {
                      const { getUserProfile } = await import('@/src/features/user/services/user.services');
                      const { data } = await getUserProfile(user.id);
                      return data;
                    },
                  });

                  // Update lastLoginAt
                  await supabase.from('User').update({ lastLoginAt: new Date().toISOString() }).eq('id', user.id);

                  router.replace('/(tabs)');
                  return; // Exit early
                }
              }
            }
          } catch (err) {
            console.error('❌ OAuth cold start error:', err);
          }
        }

        // Normal auth check - get existing session
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          const user = data.session.user;

          // Set user in Redux
          dispatch(setCurrentUser(user));

          // Save to AsyncStorage
          await AsyncStorage.setItem('authState', JSON.stringify({ user }));

          // Prefetch user profile with React Query
          await queryClient.prefetchQuery({
            queryKey: ['user-profile', user.id],
            queryFn: async () => {
              const { getUserProfile } = await import('@/src/features/user/services/user.services');
              const { data: profileData } = await getUserProfile(user.id);
              return profileData;
            },
          });

          router.replace('/(tabs)');
        } else {
          dispatch(clearCurrentUser());
          await AsyncStorage.removeItem('authState');
          router.replace('/(auth)');
        }
      } catch (err) {
        console.error('❌ Splash initialization error:', err);
        dispatch(clearCurrentUser());
        await AsyncStorage.removeItem('authState');
        queryClient.clear();
        router.replace('/(auth)');
      }
    };

    initialize();
  }, [dispatch, router, queryClient]);

  return <CustomSplashScreen status="Loading" />;
}
