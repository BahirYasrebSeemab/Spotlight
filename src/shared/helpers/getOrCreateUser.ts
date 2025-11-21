import { createUser, getUser } from '@/src/features/user/services/userServices';
import { SupabaseAuthUser, CreateUserPayload } from '@/src/shared/types/user.types';

export async function getOrCreateUser(authUser: SupabaseAuthUser) {
  const { data: dbUser } = await getUser(authUser.id);

  if (dbUser) return dbUser;

  if (!authUser.email_confirmed_at) return null;

  const payload: CreateUserPayload = {
    id: authUser.id,
    email: authUser.email,
    username: authUser.email.split('@')[0],
    name: authUser.user_metadata?.full_name || null,
    avatarUrl: authUser.user_metadata?.avatar_url || null,
  };

  const { data: newUser } = await createUser(payload);

  return newUser;
}
