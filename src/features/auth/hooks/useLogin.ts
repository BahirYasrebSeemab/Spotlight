import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '@/src/lib/supabase';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { setCurrentUser } from '@/src/features/auth/slices/authSlice';
import { reactivateAccount } from '@/src/features/user/services/user.services';

import { loginWithEmail } from '../services/authServices';

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const proceedWithLogin = async (user: any) => {
    dispatch(setCurrentUser(user));
    await AsyncStorage.setItem('authState', JSON.stringify({ user }));
    queryClient.prefetchQuery({
      queryFn: async () => {
        const { getUserProfile } = await import('@/src/features/user/services/user.services');
        const { data } = await getUserProfile(user.id);
        return data;
      },
      queryKey: ['user-profile', user.id],
    });
    router.replace('/(tabs)');
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) throw new Error('Please fill in both fields.');
      const { error, user } = await loginWithEmail(email, password);
      if (error) throw error;
      if (!user) throw new Error('Login failed');
      return user;
    },
    onError: (error: any) => {
      const msg = error.message || 'Login failed';
      setLocalError(msg);
    },
    onSuccess: async user => {
      // Check if account is deactivated
      const { data: userData } = await supabase.from('User').select('isActive').eq('id', user.id).single();

      if (userData?.isActive === false) {
        // Sign them back out, don't let them in yet
        await supabase.auth.signOut();

        Alert.alert('Account Deactivated', 'Your account is deactivated. Would you like to reactivate it?', [
          { style: 'cancel', text: 'Cancel' },
          {
            onPress: async () => {
              await reactivateAccount(user.id);
              // Re-sign in after reactivation
              const { error, user: freshUser } = await loginWithEmail(email, password);
              if (error || !freshUser) {
                setLocalError('Reactivation failed. Please try logging in again.');
                return;
              }
              await proceedWithLogin(freshUser);
            },
            text: 'Reactivate',
          },
        ]);
        return;
      }

      await proceedWithLogin(user);
    },
  });

  const handleLogin = () => {
    setLocalError(null);
    loginMutation.mutate();
  };

  return {
    email,
    handleLogin,
    loading: loginMutation.isPending,
    localError: localError || (loginMutation.error?.message ?? null),
    password,
    setEmail,
    setPassword,
  };
}
