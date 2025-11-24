import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUser } from '../services/userServices';
import { User } from '@/src/shared/types/user.types';

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'profile/fetch',
  
  async (id: string, {rejectWithValue}) => {
    const { data, error } = await getUser(id);
    if (error) return rejectWithValue(error.message || 'Failed to load user');
    return data;
  }
);



const userSlice = createSlice({
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
        state.user = action.payload; // now TS knows it's User
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userSlice.reducer;

