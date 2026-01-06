// ========================================
// src/features/auth/hooks/useSignup.ts
// ========================================
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SignupForm } from '@/src/shared/types/form.types';
import { signupWithEmail } from '@/src/features/auth/services/authServices';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { setCurrentUser } from '@/src/features/auth/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useSignup() {
  const [step, setStep] = useState(1);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<SignupForm>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPass: '',
    dob: '',
  });

  const signupMutation = useMutation({
    mutationFn: async () => {
      // Create auth user
      const { user, error } = await signupWithEmail({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
        dob: form.dob,
      });

      if (error) throw error;
      if (!user) throw new Error('Auth signup returned no user');

      return user;
    },
    onSuccess: async user => {
      console.log('✅ Signup successful:', user.id);

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
      console.error('❌ Signup error:', error);
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
    form,
    step,
    nextStep,
    prevStep,
    updateField,
    handleSignup,
    loading: signupMutation.isPending,
    error: signupMutation.error?.message || null,
  };
}
