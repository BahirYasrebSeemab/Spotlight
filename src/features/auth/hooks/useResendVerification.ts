// ========================================
// src/features/auth/hooks/useResendVerification.ts
// ========================================
import { useMutation } from '@tanstack/react-query';

import { resendVerificationEmail } from '@/src/features/auth/services/authServices';

export function useResendVerification() {
  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const result = await resendVerificationEmail(email);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result;
    },
  });

  const resend = (email: string) => {
    resendMutation.mutate(email);
  };

  return {
    loading: resendMutation.isPending,
    message: resendMutation.isSuccess ? 'Verification email sent successfully.' : resendMutation.error?.message || null,
    resend,
    success: resendMutation.isSuccess,
  };
}
