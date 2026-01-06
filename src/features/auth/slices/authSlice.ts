// ========================================
// src/features/auth/slices/authSlice.ts
// ========================================
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPasswordResetSession: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isPasswordResetSession: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set current authenticated user
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Clear all auth state (used in logout)
    clearCurrentUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isPasswordResetSession = false;
    },

    // Flag for password reset flow
    setPasswordResetSession(state, action: PayloadAction<boolean>) {
      state.isPasswordResetSession = action.payload;
    },
  },
});

export const { setCurrentUser, clearCurrentUser, setPasswordResetSession } = authSlice.actions;

export default authSlice.reducer;

// ========================================
// Selectors
// ========================================
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsPasswordResetSession = (state: { auth: AuthState }) => state.auth.isPasswordResetSession;
