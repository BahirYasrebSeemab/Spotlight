import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/src/shared/hooks/redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUser } from '@/src/features/user/slices/userSlice';

export function useUser(userId: string) {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector(state => state.user);

  useEffect(() => {
    const loadUser = async () => {
      if (!user || user.id !== userId) {
        const resultAction = await dispatch(fetchUser(userId));
        if (fetchUser.fulfilled.match(resultAction) && resultAction.payload) {
          // Save to AsyncStorage for offline/rehydration
          await AsyncStorage.setItem('authState', JSON.stringify({ user: resultAction.payload }));
        }
      }
    };

    loadUser();
  }, [userId]);

  return { user, loading, error };
}
