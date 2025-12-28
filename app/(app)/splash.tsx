// app/(app)/splash.tsx
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { setUser, setLoading, setPasswordResetSession, setError } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { useAppDispatch } from '@/src/shared/hooks/redux';

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🚀 Splash: Checking auth...');

      try {
        dispatch(setLoading(true));

        // First, check if app was opened with a deep link
        const initialUrl = await Linking.getInitialURL();
        console.log('🔗 Splash: Initial URL:', initialUrl);

        // ✅ PRIORITY 1: Check for errors in URL (expired link, etc)
        if (initialUrl && initialUrl.includes('error=')) {
          const errorMatch = initialUrl.match(/error_description=([^&]+)/);
          const errorDesc = errorMatch ? decodeURIComponent(errorMatch[1].replace(/\+/g, ' ')) : 'Unknown error';

          console.log('❌ Splash: Auth error:', errorDesc);
          dispatch(setUser(null));
          router.replace('/(auth)');
          return;
        }

        // ✅ PRIORITY 2: Check for password reset link (with token_hash)
        if (initialUrl && initialUrl.includes('type=recovery')) {
          console.log('🔑 Splash: Password reset link detected');

          // Extract token_hash from query parameters OR hash fragment
          let tokenHash = null;

          // Try query parameters first (?token_hash=...)
          const queryMatch = initialUrl.match(/[?&]token_hash=([^&#]+)/);
          if (queryMatch) {
            tokenHash = queryMatch[1];
            console.log('📝 Found token_hash in query params');
          } else {
            // Try hash fragment (#token_hash=...)
            const hashIndex = initialUrl.indexOf('#');
            if (hashIndex !== -1) {
              const hashString = initialUrl.substring(hashIndex + 1);
              const params = new URLSearchParams(hashString);
              tokenHash = params.get('token_hash');
              console.log('📝 Found token_hash in hash fragment');
            }
          }

          if (tokenHash) {
            console.log('🔐 Splash: Verifying OTP token...');

            try {
              // Verify the OTP token for password recovery
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery',
              });

              if (error) {
                console.error('❌ OTP verification failed:', error.message);
                dispatch(setError(error.message));
                router.replace('/(auth)');
                return;
              }

              if (data?.session) {
                console.log('✅ Splash: Password reset session verified!');

                // ⚠️ IMPORTANT: Only set the flag, DON'T set user
                // This prevents the session from being treated as a logged-in session
                dispatch(setPasswordResetSession(true));
                // DON'T do: dispatch(setUser(data.session.user));

                // Navigate to reset password screen
                router.replace('/(auth)/reset-password');
                return; // EXIT - don't check normal session
              } else {
                console.log('❌ No session returned from OTP verification');
                router.replace('/(auth)');
                return;
              }
            } catch (otpError) {
              console.error('❌ OTP error:', otpError);
              router.replace('/(auth)');
              return;
            }
          } else {
            console.log('❌ No token_hash found in reset URL');
            router.replace('/(auth)');
            return;
          }
        }

        // ✅ PRIORITY 3: Normal auth check (only if NOT a password reset)
        console.log('📋 Checking for existing session...');
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          // ⚠️ Check if this is a leftover password reset session
          // Recovery sessions have user_metadata with recovery info
          const isRecoverySession =
            data.session.user.aud === 'authenticated' && data.session.user.recovery_sent_at !== undefined;

          if (isRecoverySession) {
            console.log('🔑 Found leftover password reset session - signing out');
            await supabase.auth.signOut();
            dispatch(setUser(null));
            router.replace('/(auth)');
            return;
          }

          console.log('✅ Splash: Normal session found! Loading user...');
          dispatch(setUser(data.session.user));
          await dispatch(fetchUser(data.session.user.id));

          console.log('➡️ Splash: Redirecting to tabs...');
          router.replace('/(tabs)');
        } else {
          console.log('❌ Splash: No session found');
          dispatch(setUser(null));

          console.log('➡️ Splash: Redirecting to auth...');
          router.replace('/(auth)');
        }
      } catch (err) {
        console.error('❌ Splash error:', err);
        dispatch(setUser(null));
        router.replace('/(auth)');
      } finally {
        dispatch(setLoading(false));
      }
    };

    checkAuth();
  }, [dispatch, router]);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}
