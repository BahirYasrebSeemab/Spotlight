// ========================================
// src/features/auth/hooks/useSignup.ts
// ========================================
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch } from '@/src/shared/hooks/redux';
import { SignupForm } from '@/src/shared/types/form.types';
import { setCurrentUser } from '@/src/features/auth/slices/authSlice';
import { signupWithEmail } from '@/src/features/auth/services/authServices';

export function useSignup() {
  const [step, setStep] = useState(1);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<SignupForm>({
    confirmPass: '',
    dob: '',
    email: '',
    fullName: '',
    password: '',
    username: '',
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      // Create auth user
      const { error, user } = await signupWithEmail({
        dob: form.dob,
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        username: form.username,
      });

      if (error) throw error;
      if (!user) throw new Error('Auth signup returned no user');

      return user;
    },
    onError: (error: any) => {
      console.error('❌ Signup error:', error);
    },
    onSuccess: async user => {
      // Set auth user in Redux
      dispatch(setCurrentUser(user));

      // Save to AsyncStorage
      await AsyncStorage.setItem('authState', JSON.stringify({ user }));

      // Prefetch user profile
      queryClient.prefetchQuery({
        queryFn: async () => {
          const { getUserProfile } = await import('@/src/features/user/services/user.services');
          const { data } = await getUserProfile(user.id);
          return data;
        },
        queryKey: ['user-profile', user.id],
      });

      // Navigate to tabs
      router.replace('/(tabs)');
    },
  });

  const updateField = (field: keyof SignupForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSignup = () => {
    signupMutation.mutate();
  };

  return {
    error: signupMutation.error?.message || null,
    form,
    handleSignup,
    loading: signupMutation.isPending,
    nextStep,
    prevStep,
    step,
    updateField,
  };
}
