import { useEffect, useState } from 'react';
import { SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/src/lib/supabase';
import { store } from '@/src/store';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { useColorScheme } from 'nativewind';

export function useAuthGate() {
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

      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          store.dispatch(setUser(session.user));
          setInitialRoute('(tabs)');
        } else {
          store.dispatch(setUser(null));
          setInitialRoute('(auth)');
        }
      });

      // Handle deep link session manually
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

  return { fontsLoaded, initialRoute, colorScheme };
}
