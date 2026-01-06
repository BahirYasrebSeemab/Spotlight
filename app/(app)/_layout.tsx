// ========================================
// app/(app)/_layout.tsx - FIXED
// ========================================
import { useEffect, useRef } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { setCurrentUser, setPasswordResetSession, clearCurrentUser } from '@/src/features/auth/slices/authSlice';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const { colorScheme } = useColorScheme();
  const isNavigatingToReset = useRef(false);
  const isHandlingOAuth = useRef(false);

  // Handle deep links when app is ALREADY running (not cold start)
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received (app running):', url);

      // Handle OAuth callback - check for tokens in the URL
      if (url.includes('access_token') && url.includes('refresh_token')) {
        console.log('🔐 OAuth callback detected');
        isHandlingOAuth.current = true;

        try {
          const hashIndex = url.indexOf('#');
          if (hashIndex === -1) {
            console.error('❌ No hash found in OAuth URL');
            isHandlingOAuth.current = false;
            router.replace('/(auth)');
            return;
          }

          const params = new URLSearchParams(url.substring(hashIndex + 1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          console.log('🔑 Tokens extracted:', {
            hasAccessToken: !!access_token,
            hasRefreshToken: !!refresh_token,
          });

          if (!access_token || !refresh_token) {
            console.error('❌ Missing tokens in OAuth callback');
            isHandlingOAuth.current = false;
            router.replace('/(auth)');
            return;
          }

          console.log('📥 Setting session with tokens...');

          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          console.log('📦 setSession result:', {
            hasData: !!sessionData,
            hasSession: !!sessionData?.session,
            error: sessionError,
          });

          if (sessionError || !sessionData?.session) {
            console.error('❌ Session creation failed:', sessionError);
            isHandlingOAuth.current = false;
            router.replace('/(auth)');
            return;
          }

          console.log('✅ Session created successfully');
          const user = sessionData.session.user;
          console.log('👤 User ID:', user.id);

          // Set user in Redux (auth state only)
          dispatch(setCurrentUser(user));

          // Save to AsyncStorage
          await AsyncStorage.setItem('authState', JSON.stringify({ user }));

          // Prefetch user profile using React Query
          console.log('📥 Prefetching user profile...');
          try {
            await queryClient.prefetchQuery({
              queryKey: ['user-profile', user.id],
              queryFn: async () => {
                const { getUserProfile } = await import('@/src/features/user/services/user.services');
                const { data } = await getUserProfile(user.id);
                return data;
              },
            });
            console.log('✅ User profile prefetched successfully');

            // Update lastLoginAt
            await supabase.from('User').update({ lastLoginAt: new Date().toISOString() }).eq('id', user.id);
            console.log('⏰ lastLoginAt updated');
          } catch (err) {
            console.error('❌ Failed to prefetch profile:', err);
          }

          // Navigate to tabs
          console.log('🚀 Navigating to tabs...');
          setTimeout(() => {
            console.log('🔄 Executing router.replace to tabs');
            router.replace('/(tabs)');
            isHandlingOAuth.current = false;
          }, 200);
        } catch (err) {
          console.error('❌ OAuth deep link error:', err);
          console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
          isHandlingOAuth.current = false;
          router.replace('/(auth)');
        }
        return;
      }

      // Handle password recovery
      if (url.includes('type=recovery')) {
        console.log('🔑 Password reset link detected');

        let tokenHash = null;
        const queryMatch = url.match(/[?&]token_hash=([^&#]+)/);
        if (queryMatch) {
          tokenHash = queryMatch[1];
        } else {
          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const params = new URLSearchParams(url.substring(hashIndex + 1));
            tokenHash = params.get('token_hash');
          }
        }

        if (tokenHash && !isNavigatingToReset.current) {
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'recovery',
            });

            if (!error && data?.session) {
              console.log('✅ Password reset session created');
              dispatch(setPasswordResetSession(true));

              isNavigatingToReset.current = true;
              setTimeout(() => {
                router.push('/(auth)/reset-password');
                setTimeout(() => {
                  isNavigatingToReset.current = false;
                }, 1000);
              }, 100);
            }
          } catch (err) {
            console.error('❌ Password recovery error:', err);
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [dispatch, router, queryClient]);

  // Listen to auth state changes (runtime only)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔄 Auth state changed:', event);

      if (isHandlingOAuth.current) {
        console.log('⏭️ Skipping auth listener - OAuth handler is active');
        return;
      }

      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 Password recovery event');
        dispatch(setPasswordResetSession(true));
        return;
      }

      if (currentSession) {
        console.log('✅ Session active:', currentSession.user.id);
        dispatch(setCurrentUser(currentSession.user));

        // Save to AsyncStorage
        await AsyncStorage.setItem('authState', JSON.stringify({ user: currentSession.user }));

        if (event === 'SIGNED_IN') {
          // Prefetch user profile on sign in
          queryClient.prefetchQuery({
            queryKey: ['user-profile', currentSession.user.id],
            queryFn: async () => {
              const { getUserProfile } = await import('@/src/features/user/services/user.services');
              const { data } = await getUserProfile(currentSession.user.id);
              return data;
            },
          });
          dispatch(setPasswordResetSession(false));
        }
      } else {
        console.log('❌ No session - clearing state');
        dispatch(clearCurrentUser());
        await AsyncStorage.removeItem('authState');
        // Clear all React Query cache on logout
        queryClient.clear();
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [dispatch, queryClient]);

  // Hide Expo splash when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </ThemeProvider>
  );
}
