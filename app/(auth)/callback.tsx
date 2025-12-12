import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/src/lib/supabase';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { setUser } from '@/src/features/auth/slices/authSlice';

export default function OAuthCallbackHandler() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('Waiting for redirect...');

  const log = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
  };

  const processUrl = async (url: string) => {
    log(`📩 Processing URL: ${url}`);

    const parsed = Linking.parse(url);
    log(`🔍 Parsed: ${JSON.stringify(parsed, null, 2)}`);

    if (!url.includes('code=')) {
      log('❌ Missing code param → cannot exchange');
      setStatus('Invalid redirect');
      return;
    }

    setStatus('Exchanging session...');

    const { data, error } = await supabase.auth.exchangeCodeForSession(url);

    if (error) {
      log(`❌ Supabase error: ${error.message}`);
      setStatus('OAuth error');
      return;
    }

    dispatch(setUser(data.session.user));
    log('✅ Session stored, redirecting…');

    setStatus('Redirecting...');
    router.replace('/(tabs)');
  };

  useEffect(() => {
    // 1) Handle the initial redirect (important!)
    const checkInitialUrl = async () => {
      const initial = await Linking.getInitialURL();
      if (initial) {
        log(`🔗 Initial URL: ${initial}`);
        processUrl(initial);
      } else {
        log('⚠ No initial URL.');
      }
    };

    checkInitialUrl();

    // 2) Listen for future deep links (backup)
    const sub = Linking.addEventListener('url', event => {
      log(`📩 Event URL: ${event.url}`);
      processUrl(event.url);
    });

    return () => sub.remove();
  }, []);

  return (
    <ScrollView contentContainerClassName="flex-1 p-6 bg-white items-center justify-center">
      <View className="items-center max-w-md">
        <ActivityIndicator size="large" color="#007AFF" className="mb-4" />
        <Text className="text-lg text-center mb-4">{status}</Text>

        {logs.map((l, i) => (
          <Text key={i} className="text-sm text-gray-700 mb-2 font-mono">
            {l}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}
