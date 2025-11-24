import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '@/src/features/user/slices/userSlice';

export function useLoadUser() {
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector((state: any) => state.user);

  const load = (id: string) => {
    dispatch(fetchProfile(id) as any);
  };

  return { user, loading, error, load };
}
