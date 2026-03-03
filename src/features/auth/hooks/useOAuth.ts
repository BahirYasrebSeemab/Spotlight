// ========================================
// src/features/auth/hooks/useOAuth.ts
// ========================================
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { signInWithGoogle } from '../services/authServices';

export function useOAuth() {
  const [localError, setLocalError] = useState<string | null>(null);

  const oauthMutation = useMutation({
    mutationFn: async () => {
      // Start OAuth flow
      const { data, error } = await signInWithGoogle();
      if (error) throw new Error(error);

      return data;
    },
    onError: (error: any) => {
      const msg = error.message || 'Google OAuth failed';
      setLocalError(msg);
      console.error('❌ OAuth error:', msg);
    },
  });

  const handleGoogleLogin = () => {
    setLocalError(null);
    oauthMutation.mutate();
  };

  return {
    handleGoogleLogin,
    loading: oauthMutation.isPending,
    localError,
  };
}
