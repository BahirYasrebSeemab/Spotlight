// app/(app)/_layout.tsx
import { useEffect, useRef } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { setUser, setPasswordResetSession } from '@/src/features/auth/slices/authSlice';
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

  // Handle deep links when app is ALREADY running (not cold start)
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('🔗 Deep link received (app running):', url);

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
            console.error('❌ Deep link error:', err);
          }
        }
      }
    };

    // Only listen for deep links when app is running (not cold start)
    const subscription = Linking.addEventListener('url', event => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, [dispatch, router]);

  // Listen to auth state changes (runtime only)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔄 Auth state changed:', event);

      if (event === 'INITIAL_SESSION') return;

      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 Password recovery event');
        dispatch(setPasswordResetSession(true));
        return;
      }

      if (currentSession) {
        const isRecoverySession = currentSession.user.recovery_sent_at !== undefined;
        if (isRecoverySession && event === 'SIGNED_IN') {
          console.log('🔑 Recovery session - skipping normal flow');
          dispatch(setPasswordResetSession(true));
          return;
        }

        dispatch(setUser(currentSession.user));

        if (event === 'SIGNED_IN') {
          await dispatch(fetchUser(currentSession.user.id));
          dispatch(setPasswordResetSession(false));
        }
      } else {
        dispatch(setUser(null));
        dispatch(setPasswordResetSession(false));
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [dispatch]);

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
