// ========================================
// app/(app)/_layout.tsx - FIXED
// ========================================
import { useFonts } from 'expo-font';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'nativewind';
import { Stack, SplashScreen } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';

import { supabase } from '@/src/lib/supabase';
import { useAppDispatch, useAppSelector } from '@/src/shared/hooks/redux';
import { setCurrentUser, setPasswordResetSession, clearCurrentUser } from '@/src/features/auth/slices/authSlice';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const { colorScheme } = useColorScheme();
  const isNavigatingToReset = useRef(false);
  const isHandlingOAuth = useRef(false);

  // ← ADDED
  const user = useAppSelector(state => state.auth.user);

  // ← ADDED: Redirect unverified users
  useEffect(() => {
    if (user && !user.email_confirmed_at) {
      router.replace(`/(auth)/verify-email?email=${user.email ?? ''}`);
    }
  }, [user]);

  // ← ADDED: Check onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) return;
      if (!user.email_confirmed_at) return;
      const completed = await AsyncStorage.getItem(`onboarding_completed_${user.id}`);
      if (!completed) {
        router.replace('/onboarding');
      }
    };
    checkOnboarding();
  }, [user]);

  // Handle deep links when app is ALREADY running (not cold start)
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('access_token') && url.includes('refresh_token')) {
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

          if (!access_token || !refresh_token) {
            console.error('❌ Missing tokens in OAuth callback');
            isHandlingOAuth.current = false;
            router.replace('/(auth)');
            return;
          }

          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError || !sessionData?.session) {
            console.error('❌ Session creation failed:', sessionError);
            isHandlingOAuth.current = false;
            router.replace('/(auth)');
            return;
          }

          const user = sessionData.session.user;

          dispatch(setCurrentUser(user));
          await AsyncStorage.setItem('authState', JSON.stringify({ user }));

          try {
            await queryClient.prefetchQuery({
              queryFn: async () => {
                const { getUserProfile } = await import('@/src/features/user/services/user.services');
                const { data } = await getUserProfile(user.id);
                return data;
              },
              queryKey: ['user-profile', user.id],
            });
            await supabase.from('User').update({ lastLoginAt: new Date().toISOString() }).eq('id', user.id);
          } catch (err) {
            console.error('❌ Failed to prefetch profile:', err);
          }

          setTimeout(() => {
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

      if (url.includes('type=recovery')) {
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
      if (isHandlingOAuth.current) return;

      if (event === 'PASSWORD_RECOVERY') {
        dispatch(setPasswordResetSession(true));
        return;
      }

      if (currentSession) {
        dispatch(setCurrentUser(currentSession.user));
        await AsyncStorage.setItem('authState', JSON.stringify({ user: currentSession.user }));

        if (event === 'SIGNED_IN') {
          // ← ADDED: Check email verification first
          if (!currentSession.user.email_confirmed_at) {
            router.replace(`/(auth)/verify-email?email=${currentSession.user.email ?? ''}`);
            return;
          }

          // Check if account is deactivated
          const { data: userData } = await supabase
            .from('User')
            .select('isActive')
            .eq('id', currentSession.user.id)
            .single();

          if (userData?.isActive === false) {
            await supabase.auth.signOut();
            dispatch(clearCurrentUser());
            await AsyncStorage.removeItem('authState');
            router.replace({
              params: { deactivated: 'true', userId: currentSession.user.id },
              pathname: '/(auth)',
            });
            return;
          }

          queryClient.prefetchQuery({
            queryFn: async () => {
              const { getUserProfile } = await import('@/src/features/user/services/user.services');
              const { data } = await getUserProfile(currentSession.user.id);
              return data;
            },
            queryKey: ['user-profile', currentSession.user.id],
          });
          dispatch(setPasswordResetSession(false));
        }
      } else {
        dispatch(clearCurrentUser());
        await AsyncStorage.removeItem('authState');
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
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
