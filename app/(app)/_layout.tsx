// app/(app)/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useAppDispatch, useAppSelector } from '@/src/shared/hooks/redux';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const [fontsLoaded] = useFonts({ ...FontAwesome.font });
  const { colorScheme } = useColorScheme();
  
  const [authChecked, setAuthChecked] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // Initial auth check on mount
  useEffect(() => {
    const checkInitialAuth = async () => {
      console.log('🚀 Checking initial auth...');
      
      try {
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          console.log('✅ Session found');
          dispatch(setUser(data.session.user));
          await dispatch(fetchUser(data.session.user.id));
        } else {
          console.log('❌ No session');
          dispatch(setUser(null));
        }
      } catch (err) {
        console.error('❌ Auth check error:', err);
        dispatch(setUser(null));
      } finally {
        setAuthChecked(true);
        console.log('✅ Auth check complete');
      }
    };

    checkInitialAuth();
  }, [dispatch]);

  // Listen to auth state changes (logout, token refresh, new login)
  useEffect(() => {
    console.log('👂 Setting up auth listener...');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🔔 Auth event:', event);

        // Skip INITIAL_SESSION because we handle it above
        if (event === 'INITIAL_SESSION') return;

        if (currentSession) {
          dispatch(setUser(currentSession.user));
          
          // Fetch user on sign in or update, not on token refresh
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            await dispatch(fetchUser(currentSession.user.id));
          }
        } else {
          dispatch(setUser(null));
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [dispatch]);

  // Hide splash screen when ready
  useEffect(() => {
    if (fontsLoaded && authChecked) {
      console.log('🎨 Hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, authChecked]);

  // Keep splash screen visible until ready
  if (!fontsLoaded || !authChecked) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>

        {!isAuthenticated && (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
      </Stack>
    </ThemeProvider>
  );
}