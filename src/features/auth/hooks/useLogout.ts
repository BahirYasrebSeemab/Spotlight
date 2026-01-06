// ========================================
// src/features/auth/hooks/useLogout.ts
// ========================================
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearCurrentUser } from '@/src/features/auth/slices/authSlice';
import { logout as logoutService } from '@/src/features/auth/services/authServices';

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await logoutService();
      if (error) throw error;
    },
    onSuccess: async () => {
      console.log('✅ Logout successful');

      // Clear AsyncStorage
      await AsyncStorage.removeItem('authState');

      // Clear Redux auth state
      dispatch(clearCurrentUser());

      // Clear all React Query cache
      queryClient.clear();

      // Navigate to auth
      router.replace('/(auth)');
    },
    onError: (error: any) => {
      console.error('❌ Logout error:', error.message);
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return {
    handleLogout,
    loading: logoutMutation.isPending,
    error: logoutMutation.error?.message || null,
  };
}
