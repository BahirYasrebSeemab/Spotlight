import { useState } from 'react';
import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { loginWithEmail } from '../services/authServices';
import { setCurrentUser } from '@/src/features/auth/slices/authSlice';
import { supabase } from '@/src/lib/supabase';
import { reactivateAccount } from '@/src/features/user/services/user.services';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      queryKey: ['user-profile', user.id],
      queryFn: async () => {
        const { getUserProfile } = await import('@/src/features/user/services/user.services');
        const { data } = await getUserProfile(user.id);
        return data;
      },
    });
    router.replace('/(tabs)');
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) throw new Error('Please fill in both fields.');
      const { user, error } = await loginWithEmail(email, password);
      if (error) throw error;
      if (!user) throw new Error('Login failed');
      return user;
    },
    onSuccess: async user => {
      // Check if account is deactivated
      const { data: userData } = await supabase.from('User').select('isActive').eq('id', user.id).single();

      if (userData?.isActive === false) {
        // Sign them back out, don't let them in yet
        await supabase.auth.signOut();

        Alert.alert('Account Deactivated', 'Your account is deactivated. Would you like to reactivate it?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reactivate',
            onPress: async () => {
              await reactivateAccount(user.id);
              // Re-sign in after reactivation
              const { user: freshUser, error } = await loginWithEmail(email, password);
              if (error || !freshUser) {
                setLocalError('Reactivation failed. Please try logging in again.');
                return;
              }
              await proceedWithLogin(freshUser);
            },
          },
        ]);
        return;
      }

      await proceedWithLogin(user);
    },
    onError: (error: any) => {
      const msg = error.message || 'Login failed';
      setLocalError(msg);
    },
  });

  const handleLogin = () => {
    setLocalError(null);
    loginMutation.mutate();
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    handleLogin,
    localError: localError || (loginMutation.error?.message ?? null),
    loading: loginMutation.isPending,
  };
}
