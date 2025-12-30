// app/(app)/(auth)/callback.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { setUser, setLoading } from '@/src/features/auth/slices/authSlice';
import { fetchUser } from '@/src/features/user/slices/userSlice';
import CustomSplashScreen from '@/src/shared/components/CustomSplashScreen';

export default function AuthCallback() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const initialize = async () => {
      console.log('🔄 Callback: Starting initialization...');
      dispatch(setLoading(true));

      try {
        // 1️⃣ Get the session
        console.log('📡 Callback: Fetching session...');
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        console.log('📦 Session data:', data?.session?.user?.id);

        if (data?.session) {
          const user = data.session.user;
          const isRecovery = user.recovery_sent_at !== undefined;

          if (isRecovery) {
            console.log('🔐 Recovery mode detected, signing out...');
            await supabase.auth.signOut();
            dispatch(setUser(null));
            router.replace('/(auth)');
            return;
          }

          // 2️⃣ Set auth user FIRST
          console.log('👤 Setting auth user...');
          dispatch(setUser(user));

          // 3️⃣ WAIT for user data to be fetched
          console.log('📥 Fetching user profile for:', user.id);
          setStatus('Loading profile...');

          const resultAction = await dispatch(fetchUser(user.id));

          if (fetchUser.fulfilled.match(resultAction)) {
            console.log('✅ User profile fetched successfully');
          } else if (fetchUser.rejected.match(resultAction)) {
            console.error('❌ fetchUser failed:', resultAction.error);
            // Don't throw - continue anyway with basic auth
          }

          // 4️⃣ Only navigate AFTER everything is ready
          console.log('🚀 Navigating to tabs...');
          setStatus('Complete!');

          setTimeout(() => {
            router.replace('/(tabs)');
          }, 100);
        } else {
          console.log('⚠️ No session found, redirecting to auth...');
          dispatch(setUser(null));
          router.replace('/(auth)');
        }
      } catch (err: any) {
        console.error('❌ Callback error:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name,
        });
        dispatch(setUser(null));

        setTimeout(() => {
          router.replace('/(auth)');
        }, 100);
      } finally {
        dispatch(setLoading(false));
        console.log('✅ Callback: Initialization complete');
      }
    };

    initialize();
  }, [dispatch, router]);

  return <CustomSplashScreen status={status} />;
}
