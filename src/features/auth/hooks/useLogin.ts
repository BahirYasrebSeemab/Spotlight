import { useState } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithEmail } from '../services/authServices';
import { setUser, setLoading, setError } from '@/src/features/auth/slices/authSlice';
import { useRouter } from 'expo-router';

export function useLogin() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setLocalError('Please fill in both fields.');
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const { user, error } = await loginWithEmail(email, password);
      if (error) throw error;

      dispatch(setUser(user));
      await AsyncStorage.setItem('authState', JSON.stringify({ user }));

      console.log('Login success:', user);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      dispatch(setError(msg));
      setLocalError(msg);
      console.error('Login error:', msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    handleLogin,
    localError,
  };
}
