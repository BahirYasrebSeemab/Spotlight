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

  const parseFragmentParams = (url: string) => {
    const fragment = url.split('#')[1];
    if (!fragment) return {};

    return Object.fromEntries(
      fragment.split('&').map(part => part.split('=')),
    );
  };

  const processUrl = async (url: string) => {
    log(`📩 Processing URL: ${url}`);

    const params = parseFragmentParams(url);
    log(`🔍 Parsed params: ${JSON.stringify(params, null, 2)}`);

    const access_token = params.access_token;
    const refresh_token = params.refresh_token;
    const expires_in = parseInt(params.expires_in || '3600');

    if (!access_token || !refresh_token) {
      log('❌ Missing tokens → cannot set session');
      setStatus('Invalid redirect');
      return;
    }

    setStatus('Setting session…');

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) {
      log(`❌ setSession error: ${error.message}`);
      setStatus('Failed to set session');
      return;
    }

    log('🔥 Session set successfully');

    const { data: userData } = await supabase.auth.getUser();
    log(`👤 User: ${JSON.stringify(userData.user, null, 2)}`);

    dispatch(setUser(userData.user));

    setStatus('Redirecting...');
    router.replace('/(tabs)');
  };

  useEffect(() => {
    const url = Linking.getLinkingURL();
    if (url) processUrl(url);
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
