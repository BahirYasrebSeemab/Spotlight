import { useState } from 'react';
import { LoginForm } from '@/src/shared/types/form.types';
import { loginWithEmail, loginWithGoogle } from '@/src/features/auth/services/authServices';

export function useLogin() {
  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const updateField = (field: keyof LoginForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { user, error } = await loginWithEmail(form.email, form.password);
      if (error) throw error;
      console.log('Login success:', user);
      // TODO: navigate or show toast
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { data, error } = await loginWithGoogle();
      if (error) throw error;
      console.log('Google login success:', data);
    } catch (err) {
      console.error('Google login failed:', err);
    }
  };

  return { form, updateField, handleLogin, handleGoogleLogin, loading };
}
