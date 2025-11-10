import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/lib/supabase';

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

// src/features/auth/services/authServices.ts

// Important for redirect handling
WebBrowser.maybeCompleteAuthSession();

const redirectTo = AuthSession.makeRedirectUri({
  scheme: 'spotlight', // 👈 must match your app.json scheme!
});

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) throw error;

    // Start OAuth flow in a web browser
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success') {
      // The user successfully authenticated
      return { data: result, error: null };
    } else {
      return { data: null, error: 'User canceled or auth failed' };
    }
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function sendPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'exp://127.0.0.1:8081/reset-password', // UPDATE LATER FOR PRODUCTION
  });

  return { data, error };
}
