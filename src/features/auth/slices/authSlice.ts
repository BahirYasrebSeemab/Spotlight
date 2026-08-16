// ========================================
// src/features/auth/slices/authSlice.ts
// ========================================
import { User } from '@supabase/supabase-js';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isPasswordResetSession: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isPasswordResetSession: false,
  user: null,
};

const authSlice = createSlice({
  initialState,
  name: 'auth',
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

export const { clearCurrentUser, setCurrentUser, setPasswordResetSession } = authSlice.actions;

export default authSlice.reducer;

// ========================================
// Selectors
// ========================================
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsPasswordResetSession = (state: { auth: AuthState }) => state.auth.isPasswordResetSession;
