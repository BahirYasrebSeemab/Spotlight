import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '@/src/features/user/slices/userSlice';

export function useLoadUser() {
  const dispatch = useDispatch();

  const { profile, loading, error } = useSelector((state: any) => state.profile);

  const load = (id: string) => {
    dispatch(fetchProfile(id));
  };

  return { profile, loading, error, load };
}
