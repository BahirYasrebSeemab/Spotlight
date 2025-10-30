import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/src/features/auth/slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ----------------- TYPES -----------------

// RootState: the type of the whole redux state
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch: the type of the dispatch function
export type AppDispatch = typeof store.dispatch;
