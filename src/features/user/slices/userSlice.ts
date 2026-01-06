// src/features/user/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/src/shared/types/user.types';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    clearCurrentUser(state) {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCurrentUser, updateUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;
