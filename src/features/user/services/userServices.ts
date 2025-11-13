import { supabase } from '@/src/lib/supabase';

interface CreateUserPayload {
  id: string;
  email: string;
  username?: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface InsertResult<T> {
  data: T[] | null;
  error: any;
  status?: number;
  statusText?: string;
}

export async function createUser(payload: CreateUserPayload): Promise<InsertResult<User>> {
  const { id, email, username, name, bio, avatarUrl } = payload;

  return await supabase.from('User').insert([
    {
      id,
      email,
      username: username || email.split('@')[0],
      name,
      bio,
      avatarUrl,
    },
  ]);
}
