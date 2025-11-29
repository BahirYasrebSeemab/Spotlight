import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'expo-router';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    Linking.getInitialURL().then(async url => {
      if (!url) return;
      await supabase.auth.verifyOtp({ type: 'magiclink', token_hash: url });
      router.replace('/(tabs)');
    });
  }, []);

  return null;
}
