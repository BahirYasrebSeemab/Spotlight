import { useEffect, useState } from 'react';
import { Stack, SplashScreen, useRouter } from 'expo-router';
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

  
  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = await AsyncStorage.getItem('authState');
      const cachedUser = stored ? JSON.parse(stored)?.user : null;

      // ⏳ don’t set route yet — wait for Supabase to handle deep link
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          store.dispatch(setUser(session.user));
          setInitialRoute('(tabs)');
        } else {
          store.dispatch(setUser(null));
          setInitialRoute('(auth)');
        }
      });

      // handle deep link session manually (in case user came from magic link)
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        store.dispatch(setUser(data.session.user));
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
