// ========================================
// src/features/auth/hooks/useLogin.ts
// ========================================
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { loginWithEmail } from '../services/authServices';
import { setCurrentUser } from '@/src/features/auth/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: async () => {
      if (!email || !password) {
        throw new Error('Please fill in both fields.');
      }

      const { user, error } = await loginWithEmail(email, password);
      if (error) throw error;
      if (!user) throw new Error('Login failed');

      return user;
    },
    onSuccess: async user => {
      console.log('✅ Login successful:', user.id);

      // Set auth user in Redux
      dispatch(setCurrentUser(user));

      // Save to AsyncStorage
      await AsyncStorage.setItem('authState', JSON.stringify({ user }));

      // Prefetch user profile
      queryClient.prefetchQuery({
        queryKey: ['user-profile', user.id],
        queryFn: async () => {
          const { getUserProfile } = await import('@/src/features/user/services/user.services');
          const { data } = await getUserProfile(user.id);
          return data;
        },
      });

      // Navigate to tabs
      router.replace('/(tabs)');
    },
    onError: (error: any) => {
      const msg = error.message || 'Login failed';
      setLocalError(msg);
      console.error('❌ Login error:', msg);
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
