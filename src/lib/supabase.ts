import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Create a custom storage adapter that logs everything
const ConsoleStorage = {
  getItem: async (key: string) => {
    console.log('🔍 Supabase READING:', key); // Is it asking for the token?
    const val = await AsyncStorage.getItem(key);
    console.log('📦 Supabase FOUND:', val ? 'A Session String' : 'Nothing');
    return val;
  },
  setItem: async (key: string, value: string) => {
    console.log('💾 Supabase SAVING:', key); // Is it saving when you login?
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    console.log('🗑️ Supabase DELETING:', key); // Is it deleting it on startup?
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ConsoleStorage, // Use our spy adapter
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tells Supabase to resume refreshing tokens when app comes to foreground
AppState.addEventListener('change', state => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
