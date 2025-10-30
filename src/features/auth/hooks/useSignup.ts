import { useState } from 'react';
import { SignupForm } from '@/src/shared/types/form.types';
import { signupWithEmail } from '@/src/features/auth/services/authServices';

export function useSignup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<SignupForm>({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirmPass: '',
    avatar: '',
    age: undefined,
  });

  const updateField = (field: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleSignup = async () => {
    if (!form.email || !form.password) return;

    setLoading(true);
    try {
      const { user, error } = await signupWithEmail({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        username: form.username,
        avatar: form.avatar,
        age: form.age,
      });

      if (error) throw error;
      console.log('Signup success:', user);
      // TODO: navigate or show toast
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return { form, step, nextStep, prevStep, updateField, handleSignup, loading };
}
