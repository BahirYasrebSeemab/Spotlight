import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';

export function useResendVerification() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const resendVerification = async (email: string) => {
    setLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      if (error) throw error;
      setMessage('Verification email resent successfully.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return { resendVerification, loading, message };
}
