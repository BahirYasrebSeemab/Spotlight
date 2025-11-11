import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { supabase } from '@/src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import 'react-native-reanimated';
import '../global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...FontAwesome.font });
  const { colorScheme } = useColorScheme();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  // Handle font errors
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    async function bootstrap() {
      // 1️⃣ Load cached session first
      const stored = await AsyncStorage.getItem('authState');
      const cachedUser = stored ? JSON.parse(stored)?.user : null;
      store.dispatch(setUser(cachedUser));
      setInitialRoute(cachedUser ? '(tabs)' : '(auth)');

      // 2️⃣ Refresh Supabase session in the background
      if (typeof window !== 'undefined') {
        try {
          const { data } = await supabase.auth.getSession();
          const sessionUser = data.session?.user || null;

          // If Supabase session differs, update Redux & redirect if needed
          if (sessionUser && sessionUser.id !== cachedUser?.id) {
            store.dispatch(setUser(sessionUser));
          } else if (!sessionUser && cachedUser) {
            // session expired, log out
            store.dispatch(setUser(null));
            setInitialRoute('(auth)');
          }
        } catch (e) {
          console.log('Supabase session refresh failed', e);
        }
      }

      // Hide splash screen now
      await SplashScreen.hideAsync();
    }

    bootstrap();
  }, []);

  if (!fontsLoaded || !initialRoute) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Provider store={store}>
        <Stack initialRouteName={initialRoute}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
        </Stack>
      </Provider>
    </ThemeProvider>
  );
}
