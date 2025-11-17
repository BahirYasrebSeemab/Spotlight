import { supabase } from '@/src/lib/supabase';
import { UpdateUserPayload, UserProfile, CreateUserPayload } from '@/src/shared/types/user.types';

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

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<{ data: UserProfile | null; error: any }> {
  const { data, error } = await supabase
    .from('User')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

export async function createUser(payload: CreateUserPayload) {
  console.log('Creating user with payload:', payload);

  const { data, error } = await supabase
    .from('User')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  console.log('DB response:', { data, error });

  return { data, error };
}

export async function getUser(id: string): Promise<InsertResult<User>> {
  return await supabase.from('User').select('*').eq('id', id).single();
}

