// ========================================
// src/features/auth/hooks/useResetPassword.ts
// ========================================
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { applyNewPassword, logout } from '@/src/features/auth/services/authServices';
import { setPasswordResetSession, clearCurrentUser } from '@/src/features/auth/slices/authSlice';

export function useResetPassword() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!password || !confirm) {
        throw new Error('Fill both fields.');
      }
      if (password !== confirm) {
        throw new Error("Passwords don't match.");
      }

      // Update password using the existing session
      const { error } = await applyNewPassword(password);
      if (error) throw error;
    },
    onSuccess: async () => {
      console.log('✅ Password updated successfully!');
      setSuccess(true);

      // Clear the password reset flag
      dispatch(setPasswordResetSession(false));
      dispatch(clearCurrentUser());

      // Sign out the temporary recovery session
      const { error: logoutError } = await logout();
      if (logoutError) {
        console.error('❌ Logout error:', logoutError);
      }

      // Clear React Query cache
      queryClient.clear();

      // Navigate immediately
      console.log('➡️ Navigating to auth...');
      router.replace('/(auth)');
    },
    onError: (error: any) => {
      const msg = error.message || 'Error resetting password';
      setLocalError(msg);
      console.error('❌ Password reset error:', msg);
    },
  });

  const handleSubmit = () => {
    setLocalError(null);
    resetPasswordMutation.mutate();
  };

  return {
    password,
    confirm,
    setPassword,
    setConfirm,
    handleSubmit,
    localError,
    success,
    loading: resetPasswordMutation.isPending,
  };
}
