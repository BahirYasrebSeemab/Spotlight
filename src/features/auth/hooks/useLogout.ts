// ========================================
// src/features/auth/hooks/useLogout.ts
// ========================================
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAppDispatch } from '@/src/shared/hooks/redux';
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
    onError: (error: any) => {
      console.error('❌ Logout error:', error.message);
    },
    onSuccess: async () => {
      // Clear AsyncStorage
      await AsyncStorage.removeItem('authState');

      // Clear Redux auth state
      dispatch(clearCurrentUser());

      // Clear all React Query cache
      queryClient.clear();

      // Navigate to auth
      router.replace('/(auth)');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return {
    error: logoutMutation.error?.message || null,
    handleLogout,
    loading: logoutMutation.isPending,
  };
}
