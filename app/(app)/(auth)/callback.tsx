// app/(app)/(auth)/callback.tsx
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { setPasswordResetSession, setUser } from '@/src/features/auth/slices/authSlice';

export default function AuthCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔗 Callback: Processing...');

      try {
        // Get the full URL with hash
        const url = await Linking.getInitialURL();

        if (!url) {
          console.log('❌ No URL found');
          setTimeout(() => router.replace('/(auth)'), 500);
          return;
        }

        console.log('🔗 Callback URL:', url);

        // Check for errors in URL
        if (url.includes('error=')) {
          const errorMatch = url.match(/error_description=([^&]+)/);
          const errorDesc = errorMatch ? decodeURIComponent(errorMatch[1].replace(/\+/g, ' ')) : 'Unknown error';

          console.error('❌ Auth error:', errorDesc);
          setStatus(`Error: ${errorDesc}`);

          setTimeout(() => router.replace('/(auth)'), 2000);
          return;
        }

        // Check if it's a password reset link
        if (url.includes('type=recovery')) {
          console.log('🔑 Password reset detected');

          const hashIndex = url.indexOf('#');
          if (hashIndex !== -1) {
            const hashString = url.substring(hashIndex + 1);
            const params = new URLSearchParams(hashString);

            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (data?.session && !error) {
                console.log('✅ Session created');
                dispatch(setPasswordResetSession(true));
                dispatch(setUser(data.session.user));

                setStatus('Redirecting to reset password...');
                setTimeout(() => router.replace('/(auth)/reset-password'), 500);
                return;
              }
            }
          }
        }

        // Default: go to auth
        setTimeout(() => router.replace('/(auth)'), 500);
      } catch (err) {
        console.error('❌ Callback error:', err);
        setStatus('An error occurred');
        setTimeout(() => router.replace('/(auth)'), 2000);
      }
    };

    handleCallback();
  }, [dispatch, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-600 dark:text-gray-400">{status}</Text>
    </View>
  );
}
