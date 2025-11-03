// ✅ useOAuth with local loading
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithGoogle } from '../services/authServices';
import { setUser, setError } from '@/src/features/auth/slices/authSlice';
import { useRouter } from 'expo-router';

export function useOAuth() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      dispatch(setError(null));
      setLocalError(null);

      const { data, error } = await signInWithGoogle();
      if (error) throw error;

      // signInWithGoogle does not return a user, so set user to null or fetch user info if needed
      dispatch(setUser(data));
      await AsyncStorage.setItem('authState', JSON.stringify({ data }));

      console.log('Google OAuth success:', data);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err.message || 'Google sign-in failed';
      dispatch(setError(msg));
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  return { handleGoogleLogin, loading, localError };
}
