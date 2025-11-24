import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '@/src/features/user/slices/userSlice';

export function useLoadUser() {
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state: any) => state.user);

  const load = (id: string) => {
    dispatch(fetchUser(id) as any);
  };

  return { user, loading, error, load };
}
