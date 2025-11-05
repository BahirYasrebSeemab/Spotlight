import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout as logoutAction, setLoading, setError } from '@/src/features/auth/slices/authSlice';
import { logout as logoutService } from '@/src/features/auth/services/authServices';
import { useRouter } from 'expo-router';

export function useLogout() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const { error } = await logoutService();
      if (error) throw error;

      await AsyncStorage.removeItem('authState');
      dispatch(logoutAction());
      router.replace('/(auth)');
    } catch (err: any) {
      console.error('Logout error:', err.message);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { handleLogout };
}
