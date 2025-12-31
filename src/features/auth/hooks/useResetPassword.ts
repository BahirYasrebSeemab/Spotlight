import { useState } from 'react';
import { useRouter } from 'expo-router';
import { applyNewPassword, logout } from '@/src/features/auth/services/authServices';
import { useDispatch } from 'react-redux';
import { setLoading, setError, setPasswordResetSession, setUser } from '@/src/features/auth/slices/authSlice';

export function useResetPassword() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!password || !confirm) {
      setLocalError('Fill both fields.');
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
      // Update password using the existing session
      const { error } = await applyNewPassword(password);

      if (error) throw error;

      console.log('✅ Password updated successfully!');
      setSuccess(true);

      // Clear the password reset flag and user state
      dispatch(setPasswordResetSession(false));
      dispatch(setUser(null));

      // Sign out the temporary recovery session
      const { error: logoutError } = await logout();

      if (logoutError) {
        console.error('❌ Logout error:', logoutError);
      }

      // Navigate immediately, don't wait for auth state change
      console.log('➡️ Navigating to auth...');
      router.replace('/(auth)');
    } catch (err: any) {
      const msg = err.message || 'Error resetting password';
      console.error('❌ Password reset error:', msg);
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
