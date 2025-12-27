import { useState } from 'react';
import { SignupForm } from '@/src/shared/types/form.types';
import { signupWithEmail } from '@/src/features/auth/services/authServices';
import { useRouter } from 'expo-router';
import { setUser, setLoading, setError } from '@/src/features/auth/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@/src/store';
import { useAppDispatch, useAppSelector } from '@/src/shared/hooks/redux';
import { fetchUser } from '../../user/slices/userSlice';

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
      // 1️⃣ Create Auth user
      const { user, error } = await signupWithEmail({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
        dob: form.dob,
      });

      if (error) throw error;
      if (!user) throw new Error('Auth signup returned no user');

      const userId = user.id;


      console.log(userId);

      const profile = await dispatch(fetchUser(userId)).unwrap();

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

