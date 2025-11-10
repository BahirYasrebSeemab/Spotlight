import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { applyNewPassword } from '../services/authServices';
import { useDispatch } from 'react-redux';
import { setLoading, setError } from '@/src/features/auth/slices/authSlice';

export function useResetPassword() {
  const params = useLocalSearchParams();
  const accessToken = params.access_token as string;

  const dispatch = useDispatch();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setLocalError("Fill both fields.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords don't match.");
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    setLocalError(null);

    try {
      const { error } = await applyNewPassword(accessToken, password);
      if (error) throw error;

      setSuccess(true);
      router.replace('/(auth)');
    } catch (err: any) {
      const msg = err.message || "Error resetting password";
      dispatch(setError(msg));
      setLocalError(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    password,
    confirm,
    setPassword,
    setConfirm,
    handleSubmit,
    localError,
    success,
  };
}
