import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUser } from '../services/userServices';
import { User } from '@/src/generated/prisma/wasm';

interface ProfileState {
  profile: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  
  async (userId: string, {rejectWithValue}) => {
    const { data, error } = await getUser(userId);
    if (error) return rejectWithValue(error.message || 'Failed to load user');
    return data;
  }
);



const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload; // now TS knows it's User
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default profileSlice.reducer;

