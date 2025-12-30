// app/(app)/splash.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Linking } from 'react-native';
import { supabase } from '@/src/lib/supabase';
import { setUser, setLoading, setPasswordResetSession } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import CustomSplashScreen from '@/src/shared/components/CustomSplashScreen';

export default function SplashScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initialize = async () => {
      console.log('🚀 Splash: Initializing...');

      try {
        dispatch(setLoading(true));

        // Check for deep link first
        const initialUrl = await Linking.getInitialURL();
        console.log('🔗 Initial URL:', initialUrl);

        // Handle password reset link
        if (initialUrl && initialUrl.includes('type=recovery')) {
          console.log('🔑 Password reset link detected');

          let tokenHash = null;
          const queryMatch = initialUrl.match(/[?&]token_hash=([^&#]+)/);
          if (queryMatch) {
            tokenHash = queryMatch[1];
          } else {
            const hashIndex = initialUrl.indexOf('#');
            if (hashIndex !== -1) {
              const params = new URLSearchParams(initialUrl.substring(hashIndex + 1));
              tokenHash = params.get('token_hash');
            }
          }

          if (tokenHash) {
            try {
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type: 'recovery',
              });

              if (!error && data?.session) {
                console.log('✅ Password reset session created');
                dispatch(setPasswordResetSession(true));
                router.replace('/(auth)/reset-password');
                return; // Exit early
              }
            } catch (err) {
              console.error('❌ OTP error:', err);
            }
          }
        }

        // Normal auth check
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          const isRecoverySession = data.session.user.recovery_sent_at !== undefined;

          if (isRecoverySession) {
            console.log('🔑 Leftover reset session - signing out');
            await supabase.auth.signOut();
            dispatch(setUser(null));
            router.replace('/(auth)');
          } else {
            console.log('✅ Session found - loading user');
            dispatch(setUser(data.session.user));
            await dispatch(fetchUser(data.session.user.id));
            router.replace('/(tabs)');
          }
        } else {
          console.log('❌ No session');
          dispatch(setUser(null));
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

    initialize();
  }, [dispatch, router]);

  return (
    <CustomSplashScreen status='Loading'/>
  );
}
