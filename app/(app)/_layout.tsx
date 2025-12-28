// app/(app)/_layout.tsx
import { useEffect } from 'react';
import { Stack, SplashScreen } from 'expo-router';
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

  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  // Listen to auth state changes (for runtime changes only)
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log('🔄 Auth state changed:', event);

      // Skip initial session - already handled by splash
      if (event === 'INITIAL_SESSION') return;

      if (event === 'PASSWORD_RECOVERY') {
        console.log('🔑 Password recovery event detected');
        dispatch(setPasswordResetSession(true));
        router.replace('/(auth)/reset-password');
        return;
      }

      if (currentSession) {
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

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [dispatch, router]);

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Screen name="(auth)" />
      </Stack>
    </ThemeProvider>
  );
}
