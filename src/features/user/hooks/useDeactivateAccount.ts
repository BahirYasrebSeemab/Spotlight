import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { deactivateAccount } from '@/src/features/user/services/user.services';
import { clearCurrentUser } from '@/src/features/auth/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useLogout } from '@/src/features/auth/hooks';

export function useDeactivateAccount() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleLogout } = useLogout();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { success, error } = await deactivateAccount(userId);
      if (!success) throw new Error(error);
    },
    onSuccess: async () => {
      handleLogout();
      dispatch(clearCurrentUser());
      await AsyncStorage.removeItem('authState');
      queryClient.clear();
      router.replace('/(auth)');
    },
  });
}
