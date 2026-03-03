import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/lib/supabase';

interface SignupPayload {
  email: string;
  password: string;
  fullName: string;
  username: string;
  avatar?: string;
  dob?: string | null;
}

export async function signupWithEmail(payload: SignupPayload) {
  const { email, password, fullName, username, avatar, dob } = payload;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { fullName, username, avatar, dob },
    },
  });

  return { user: data.user, error };
}

export async function resendVerificationEmail(email: string) {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to resend verification email' };
  }
}

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { user: data.user, error };
}

// authServices.ts
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    return { error: error || null }; // Ensure we always return { error }
  } catch (err) {
    return { error: err as Error };
  }
}

// Important for redirect handling
WebBrowser.maybeCompleteAuthSession();

const redirectTo = AuthSession.makeRedirectUri({
  scheme: 'spotlight',
});

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) throw error;

    // Start OAuth flow in a web browser
    const result = await WebBrowser.openAuthSessionAsync(data?.url, redirectTo);

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
    redirectTo: 'https://spotlight-web.expo.app',
  });

  return { data, error };
}

export async function applyNewPassword(password: string) {
  try {
    // The session already exists from verifyOtp, just update the password
    const { data, error } = await supabase.auth.updateUser({ password });

    if (error) return { data: null, error };

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}
