// src/store/index.ts (or wherever your store is configured)
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/src/features/auth/slices/authSlice';
// Remove userReducer import

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Remove user: userReducer
    // Add other slices as needed
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Supabase user objects
        ignoredActions: ['auth/setCurrentUser'],
        ignoredPaths: ['auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
