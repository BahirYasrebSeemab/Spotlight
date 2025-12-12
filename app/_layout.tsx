import { useEffect, useState } from 'react';
import { Stack, SplashScreen } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { supabase } from '@/src/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import '../global.css';
import * as Linking from 'expo-linking'

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...FontAwesome.font });
  const { colorScheme } = useColorScheme();
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const bootstrap = async () => {
      console.log(Linking.useLinkingURL())
      // 🔥 AUTH STATE LISTENER
      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          store.dispatch(setUser(session.user));

          // Always fetch FRESH profile
          const result = await store.dispatch(fetchUser(session.user.id));

          // Cache fresh version (NOT USED on startup)
          await AsyncStorage.setItem('profile', JSON.stringify(result.payload));

          setInitialRoute('(tabs)');
        } else {
          store.dispatch(setUser(null));
          await AsyncStorage.removeItem('profile');
          setInitialRoute('(auth)');
        }
      });

      const { data } = await supabase.auth.getClaims();

      if (data?.claims) {
        store.dispatch(setUser(data.claims));

        // Fetch fresh
        const result = await store.dispatch(fetchUser(data.claims.id));
        await AsyncStorage.setItem('profile', JSON.stringify(result.payload));

        setInitialRoute('(tabs)');
      } else {
        setInitialRoute('(auth)');
      }

      await SplashScreen.hideAsync();

      return () => {
        listener.subscription.unsubscribe();
      };
    };

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
