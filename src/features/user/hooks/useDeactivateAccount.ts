import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useLogout } from '@/src/features/auth/hooks';
import { clearCurrentUser } from '@/src/features/auth/slices/authSlice';
import { deactivateAccount } from '@/src/features/user/services/user.services';

export function useDeactivateAccount() {
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleLogout } = useLogout();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error, success } = await deactivateAccount(userId);
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
