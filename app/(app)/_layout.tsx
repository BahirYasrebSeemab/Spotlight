// app/(app)/_layout.tsx
import { useEffect, useRef, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { setUser, setPasswordResetSession, setLoading } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useAppDispatch, useAppSelector } from '@/src/shared/hooks/redux';
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const { colorScheme } = useColorScheme();
  const isNavigatingToReset = useRef(false);
  const [authChecked, setAuthChecked] = useState(false);

  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  // Initial auth check on mount
  useEffect(() => {
    const checkInitialAuth = async () => {
      console.log('🚀 Checking initial auth...');

      try {
        dispatch(setLoading(true));
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          // Check if it's a leftover password reset session
          const isRecoverySession = data.session.user.recovery_sent_at !== undefined;

          if (isRecoverySession) {
            console.log('🔑 Leftover reset session - signing out');
            await supabase.auth.signOut();
            dispatch(setUser(null));
          } else {
            // Normal session
            console.log('✅ Session found');
            dispatch(setUser(data.session.user));
            await dispatch(fetchUser(data.session.user.id));
          }
        } else {
          console.log('❌ No session');
          dispatch(setUser(null));
        }
      } catch (err) {
        console.error('❌ Auth check error:', err);
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
        setAuthChecked(true);
        console.log('✅ Auth check complete');
      }
    };

    checkInitialAuth();
  }, [dispatch]);

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received:', url);

      // Handle password reset
      if (url.includes('type=recovery')) {
        console.log('🔑 Password reset link detected');

        // Extract token_hash
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
            } else {
              console.error('❌ OTP verification failed:', error?.message);
            }
          } catch (err) {
            console.error('❌ Deep link error:', err);
          }
        }
      }
    };

    // Handle deep link on cold start
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    // Handle deep links when app is running
    const subscription = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [dispatch, router]);

  // Listen to auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔄 Auth state changed:', event);

      if (event === 'INITIAL_SESSION') return;

      // Skip navigation for PASSWORD_RECOVERY - handled by deep link
      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 Password recovery event');
        dispatch(setPasswordResetSession(true));
        return;
      }

      if (currentSession) {
        // Skip if it's a recovery session from SIGNED_IN
        const isRecoverySession = currentSession.user.recovery_sent_at !== undefined;
        if (isRecoverySession && event === 'SIGNED_IN') {
          console.log('🔑 Recovery session - skipping normal flow');
          dispatch(setPasswordResetSession(true));
          return;
        }

        dispatch(setUser(currentSession.user));

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await dispatch(fetchUser(currentSession.user.id));
          dispatch(setPasswordResetSession(false));
        }
      } else {
        dispatch(setUser(null));
        dispatch(setPasswordResetSession(false));
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [dispatch, router]);

  // Hide splash when ready
  useEffect(() => {
    if (fontsLoaded && authChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authChecked]);

  // Keep splash visible until ready
  if (!fontsLoaded || !authChecked) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Screen name="(auth)" />
      </Stack>
    </ThemeProvider>
  );
}
