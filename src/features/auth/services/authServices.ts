import { supabase } from '@/src/shared/lib/supabase';

interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  username: string;
  avatar?: string;
  age?: string | number;
}

export async function signupWithEmail(payload: SignupPayload) {
  const { email, password, fullName, username, avatar, age } = payload;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { fullName, username, avatar, age },
    },
  });

  return { user: data.user, error };
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data.user, error };
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });

  return { data, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
