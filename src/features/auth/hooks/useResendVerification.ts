import { useState } from 'react';
import { resendVerificationEmail } from '@/src/features/auth/services/authServices';

export function useResendVerification() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const resend = async (email: string) => {
    setLoading(true);
    setMessage(null);
    const result = await resendVerificationEmail(email);
    if (result.success) {
      setMessage('Verification email sent successfully.');
    } else {
      setMessage(result.error);
    }
    setLoading(false);
  };

  return { resend, loading, message };
}
