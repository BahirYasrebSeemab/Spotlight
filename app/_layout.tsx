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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    async function bootstrap() {
      try {
        // Load local cache first
        const stored = await AsyncStorage.getItem('authState');
        const cachedUser = stored ? JSON.parse(stored)?.user : null;

        // Check Supabase session
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user || null;

        const finalUser = sessionUser || cachedUser;

        // Preload Redux state BEFORE Provider mounts
        store.dispatch(setUser(finalUser));

        setInitialRoute(finalUser ? '(tabs)' : '(auth)');
      } catch (e) {
        console.log('Auth load error:', e);
        setInitialRoute('(auth)');
      } finally {
        setReady(true);
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    if (ready && fontsLoaded && initialRoute) {
      SplashScreen.hideAsync();
    }
  }, [ready, fontsLoaded, initialRoute]);

  if (!ready || !fontsLoaded || !initialRoute) return null;

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
