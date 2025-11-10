import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { sendPasswordReset } from '../services/authServices';
import { setError, setLoading } from '../slices/authSlice';

export function useForgotPassword() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setLocalError('Email is required.');
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));
    setLocalError(null);
    setSuccess(false);

    try {
      const { error } = await sendPasswordReset(email);
      if (error) throw error;

      setSuccess(true); // ✅ we show success message
    } catch (err: any) {
      const msg = err.message || 'Something went wrong.';
      dispatch(setError(msg));
      setLocalError(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    email,
    setEmail,
    handleReset,
    localError,
    success,
  };
}
