import { useState } from 'react';
import { SignupForm } from '@/src/shared/types/form.types';
import { signupWithEmail } from '@/src/features/auth/services/authServices';
import { useRouter } from 'expo-router';
import { setUser, setLoading, setError } from '@/src/features/auth/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@/src/store';
import { createUser } from '@/src/features/user/services/userServices';
import { useAppDispatch, useAppSelector } from '@/src/shared/hooks/redux';

export function useSignup() {
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, error } = useAppSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<SignupForm>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPass: '',
    avatar: '',
    dob: '',
  });

  const updateField = (field: keyof SignupForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSignup = async () => {
    dispatch(setLoading(true));

    try {
      const { user, error } = await signupWithEmail({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
        avatar: form.avatar,
        dob: form.dob,
      });

      if (error) throw error;
      if (!user) throw new Error('Auth signup returned no user');

      // Construct correct payload for your Prisma model
      const profilePayload = {
        id: user.id,
        email: user.email!,
        username: form.username.toLowerCase(),
        name: form.fullName,
        avatarUrl: form.avatar,
        dob: form.dob,
        provider: user.app_metadata?.provider || 'email',
        lastLoginAt: new Date(),
      };

      const { data: profile, error: createErr } = await createUser(profilePayload);
      if (createErr) throw createErr;

      const combined = { ...user, profile };

      dispatch(setUser(combined));
      await AsyncStorage.setItem('authState', JSON.stringify({ user: combined }));

      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Signup error:', err);
      dispatch(setError(err.message || 'Signup failed'));
    } finally {
      dispatch(setLoading(false));
    }
  };


  return {
    form,
    step,
    nextStep,
    prevStep,
    updateField,
    handleSignup,
    localError,
    loading,
    error,
  };
}
