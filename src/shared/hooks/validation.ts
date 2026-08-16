import { useState } from 'react';

export function useValidation() {
  const [error, setError] = useState<string | null>(null);

  const validateUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    const valid = regex.test(username);
    setError(valid ? null : 'Username must be 3-20 characters using letters, numbers, or underscores.');
    return valid;
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[0-9]).{8,}$/;
    const valid = regex.test(password);
    setError(valid ? null : 'Password must be 8+ chars with at least one number');
    return valid;
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = regex.test(email);
    setError(valid ? null : 'Invalid email format');
    return valid;
  };

  return {
    error,
    setError,
    validateEmail,
    validatePassword,
    validateUsername,
  };
}
