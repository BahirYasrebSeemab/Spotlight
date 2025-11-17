import { useDispatch } from 'react-redux';
import { getUser } from '../services/userServices';
import { setUser } from '@/src/features/auth/slices/authSlice';

export function useLoadUser() {
  const dispatch = useDispatch();

  const load = async (id: string) => {
    const { data, error } = await getUser(id);

    if (error) {
      console.error('Load user error:', error);
      return null;
    }

    if (data) {
      dispatch(setUser(data));
    }

    return data;
  };

  return { load };
}
