import { supabase } from '@/src/lib/supabase';
import { UpdateUserPayload, UserProfile, User, CreateUserPayload } from '@/src/shared/types/user.types';

interface InsertResult<T> {
  data: T | null;
  error: any;
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload,
): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.from('User').update(payload).eq('id', id).select().single();

  return { data, error };
}

export async function createUser(payload: CreateUserPayload) {
  console.log("Calling edge function to create user...");

  const { data, error } = await supabase.functions.invoke(
    "create-user",
    { body: payload }
  );

  if (error) {
    console.log("Edge fn error:", error);
  }

  return { data: data?.user, error };
}

export async function getUser(id: string): Promise<InsertResult<User>> {
  return await supabase.from('User').select('*').eq('id', id).single();
}

export async function uploadAvatar(userId: string, file: any) {
  if (!file) return null;

  const ext = file.fileName?.split('.').pop() || 'jpg';
  const path = `avatars/${userId}.${ext}`;

  const { error } = await supabase.storage.from('avatars').upload(
    path,
    {
      uri: file.uri,
      type: file.type,
      name: file.fileName,
    },
    { upsert: true },
  );

  if (error) throw error;

  const { data: url } = supabase.storage.from('avatars').getPublicUrl(path);
  return url.publicUrl;
}

