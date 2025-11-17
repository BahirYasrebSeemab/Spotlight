import { updateUser } from '../services/userServices';
import { useDispatch } from 'react-redux';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { UpdateUserPayload, UserProfile } from '@/src/shared/types/user.types';

export function useUpdateUser() {
  const dispatch = useDispatch();

  const submit = async (
    id: string,
    payload: UpdateUserPayload
  ): Promise<{ data: UserProfile | null; error: any }> => {
    const { data, error } = await updateUser(id, payload);
    if (!error && data) dispatch(setUser(data));
    return { data, error };
  };

  return { submit };
}
