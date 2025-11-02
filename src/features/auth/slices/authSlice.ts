// // src/store/slices/authSlice.ts
// import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { signupWithEmail, loginWithGoogle, loginWithEmail, logout as logoutService } from '../services/authServices';

// interface AuthState {
//   user: any | null;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AuthState = {
//   user: null,
//   loading: false,
//   error: null,
// };

// // --- Async Thunks ---

// export const login = createAsyncThunk(
//   'auth/login',
//   async (
//     { email, password }: { email: string; password: string },
//     { rejectWithValue }
//   ) => {
//     try {
//       const { user, error } = await loginWithEmail(email, password);
//       if (error) throw new Error(error.message);
//       await AsyncStorage.setItem('authState', JSON.stringify({ user }));
//       return user;
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const signup = createAsyncThunk(
//   'auth/signup',
//   async (payload: {
//     email: string;
//     password: string;
//     fullName: string;
//     username: string;
//     avatar?: string;
//     age?: string | number;
//   }, { rejectWithValue }) => {
//     try {
//       const { user, error } = await signupWithEmail(payload);
//       if (error) throw new Error(error.message);

//       await AsyncStorage.setItem('authState', JSON.stringify({ user }));

//       return user;
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );



// export const signupWithGoogleOAuth = createAsyncThunk(
//   'auth/signupWithGoogleOAuth',
//   async(
//     _,
//     { rejectWithValue }
//   ) => {
//     try {
//       const { data, error } = await loginWithGoogle();
//       if (error) throw new Error(error.message);
//       await AsyncStorage.setItem('authState', JSON.stringify({ user: data }));
//       return data;
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const loadAuthState = createAsyncThunk('auth/loadAuthState', async () => {
//   const stored = await AsyncStorage.getItem('authState');
//   return stored ? JSON.parse(stored).user : null;
// });

// export const logout = createAsyncThunk('auth/logout', async () => {
//   await logoutService();
//   await AsyncStorage.removeItem('authState');
//   return null;
// });

// // --- Slice ---

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(login.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
//         state.loading = false;
//         state.user = action.payload;
//       })
//       .addCase(login.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
//       .addCase(loadAuthState.fulfilled, (state, action: PayloadAction<any>) => {
//         state.user = action.payload;
//       })
//       .addCase(logout.fulfilled, (state) => {
//         state.user = null;
//       }).addMatcher
//   },
// });

// export default authSlice.reducer;


// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setUser, setLoading, setError, logout } = authSlice.actions;
export default authSlice.reducer;
