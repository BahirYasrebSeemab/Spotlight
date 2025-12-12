import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/lib/supabase';
import * as Linking from 'expo-linking';

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

export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  try {
    const redirectTo = AuthSession.makeRedirectUri({ scheme: 'spotlight', path: 'callback' });

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { response_type: 'code' },
      },
    });

    console.log('signInWithGoogle data:', data, 'error:', error);
    if (error) throw error;
    if (!data?.url) throw new Error('No OAuth URL returned');

    // Open Google login in a browser
    await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    // Don't manually call exchangeCodeForSession, onAuthStateChange handles it
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err.message };
  }
}

export async function sendPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'spotlight://reset-password',
  });

  return { data, error };
}

export async function applyNewPassword(accessToken: string, refreshToken: string, password: string) {
  // Require both tokens because setSession expects { access_token, refresh_token }
  if (!accessToken) return { error: new Error('No access token') };
  if (!refreshToken) return { error: new Error('No refresh token') };

  try {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) return { error: sessionError };

    // Now update the user's password (no second arg with accessToken)
    const { data, error } = await supabase.auth.updateUser({ password });
    return { data, error };
  } catch (err) {
    return { error: err as Error };
  }
}
