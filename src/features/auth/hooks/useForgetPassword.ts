// ========================================
// src/features/auth/hooks/useForgotPassword.ts
// ========================================
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { sendPasswordReset } from '../services/authServices';

export function useForgotPassword() {
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetMutation = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error('Email is required.');
      }

      const { error } = await sendPasswordReset(email);
      if (error) throw error;
    },
    onError: (error: any) => {
      const msg = error.message || 'Something went wrong.';
      setLocalError(msg);
      setSuccess(false);
      console.error('❌ Password reset error:', msg);
    },
    onSuccess: () => {
      setSuccess(true);
      setLocalError(null);
    },
  });

  const handleReset = () => {
    setLocalError(null);
    setSuccess(false);
    resetMutation.mutate();
  };

  return {
    email,
    handleReset,
    loading: resetMutation.isPending,
    localError,
    setEmail,
    success,
  };
}
