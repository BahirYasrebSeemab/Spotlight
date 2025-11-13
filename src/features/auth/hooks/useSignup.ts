import { useState } from 'react';
import { SignupForm } from '@/src/shared/types/form.types';
import { signupWithEmail } from '@/src/features/auth/services/authServices';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, setLoading, setError } from '@/src/features/auth/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '@/src/store';
import { createUser } from '@/src/features/user/services/userServices';

export function useSignup() {
  const [step, setStep] = useState(1);
  const [localError, setLocalError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<SignupForm>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPass: '',
    avatar: '',
    age: undefined,
  });

  const updateField = (field: keyof SignupForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSignup = async () => {
    if (!form.email || !form.password) {
      setLocalError('Please fill in both email and password.');
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    setLocalError(null);

    try {
      const { user, error } = await signupWithEmail({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
        avatar: form.avatar,
        age: form.age,
      });

      if (error) throw error;

      // Ensure 'user' is not null/undefined before accessing properties
      if (!user) {
        throw new Error('Signup failed: no user returned from auth service.');
      }

      // Ensure necessary user properties exist (prevents passing `undefined` where a `string` is required)
      if (!user.id || !user.email) {
        throw new Error('Signup failed: incomplete user data returned from auth service.');
      }

      // Create minimal user record in DB
      await createUser({
        id: user.id,
        email: user.email,
        username: form.username,
        name: form.fullName,
      });

      dispatch(setUser(user));
      await AsyncStorage.setItem('authState', JSON.stringify({ user }));

      console.log('Signup success:', user);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.message || 'Signup failed';
      console.error('Signup error:', msg);
      dispatch(setError(msg));
      setLocalError(msg);
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
