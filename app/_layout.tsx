import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { supabase } from '@/src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { useFonts } from 'expo-font';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // your fonts
  });

  const { colorScheme } = useColorScheme();

  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadAuth() {
      try {
        // 1. load local cache
        const stored = await AsyncStorage.getItem('authState');
        const cachedUser = stored ? JSON.parse(stored)?.user : null;

        // 2. load supabase session
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user || null;

        const finalUser = sessionUser || cachedUser;

        // 3. set redux user
        store.dispatch(setUser(finalUser));

        // 4. choose initial route (NO NAVIGATION)
        setInitialRoute(finalUser ? '(tabs)' : '(auth)');
      } catch (e) {
        console.log('Gate error:', e);
        setInitialRoute('(auth)');
      } finally {
        setReady(true);
      }
    }

    loadAuth();
  }, []);

  useEffect(() => {
    if (ready && loaded && initialRoute) {
      SplashScreen.hideAsync();
    }
  }, [ready, loaded, initialRoute]);

  if (!ready || !loaded || !initialRoute) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Provider store={store}>
        <Stack initialRouteName={initialRoute}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </Provider>
    </ThemeProvider>
  );
}
