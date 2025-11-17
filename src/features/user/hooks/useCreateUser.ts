import { createUser } from '../services/userServices';
import { useDispatch } from 'react-redux';
import { setUser } from '@/src/features/auth/slices/authSlice';
import { CreateUserPayload } from '@/src/shared/types/user.types';

export function useCreateUser() {
  const dispatch = useDispatch();

  const submit = async (payload: CreateUserPayload) => {
    const { data, error } = await createUser(payload);

    if (!error && data) {
      dispatch(setUser(data));
    }

    return { data, error };
  };

  return { submit };
}
