import { supabase } from '@/src/lib/supabase';
import { UpdateUserPayload, User } from '@/src/shared/types/user.types';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

export interface UserProfileData {
  id: string;
  username: string;
  name: string | null;
  email: string;
  avatarUrl: string;
  bio: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  ownershipsCount: number;
  internationalCount: number;
  localCount: number;
  tailoredCount: number;
  createdAt: string;
  dob: string | null;
}

export interface UserPost {
  id: string;
  caption: string | null;
  mediaUrl: string | null;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

interface InsertResult<T> {
  data: T | null;
  error: any;
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<{ data: any; error: any }> {
  const { data, error } = await supabase.from('User').update(payload).eq('id', id).select().single();

  return { data, error };
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

export async function uploadAvatarToSupabase(userId: string, uri: string) {
  try {
    // Read file as BASE64
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const bytes = Buffer.from(base64, 'base64');

    const ext = uri.split('.').pop() ?? 'jpg';
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to Supabase
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, bytes, {
      contentType: `image/${ext}`,
      upsert: true,
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: any) {
    console.error('uploadAvatarToSupabase error:', err);
    throw new Error('Failed to upload avatar');
  }
}

// Fetch user profile by ID
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase.from('User').select('*').eq('id', userId).single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch user profile' };
  }
}

// Fetch user profile by username
export async function getUserProfileByUsername(username: string) {
  try {
    const { data, error } = await supabase.from('User').select('*').eq('username', username).single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch user profile' };
  }
}

// Fetch user's posts
export async function getUserPosts(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Post')
      .select(
        `
        id,
        caption,
        mediaUrl,
        createdAt,
        likesCount,
        commentsCount,
        author:authorId (
          id,
          username,
          avatarUrl
        )
      `,
      )
      .eq('authorId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch posts' };
  }
}

// Fetch user's ownerships (products they own)
export async function getUserOwnerships(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Ownership')
      .select(
        `
        id,
        status,
        verified,
        createdAt,
        product:productId (
          id,
          name,
          imageUrl,
          category,
          brand:brandId (
            id,
            name,
            logoUrl,
            type
          )
        )
      `,
      )
      .eq('ownerId', userId)
      .eq('status', 'owned')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch ownerships' };
  }
}

// Toggle account privacy
export async function toggleAccountPrivacy(userId: string, isPrivate: boolean) {
  try {
    const { error } = await supabase
      .from('User')
      .update({ isPrivate })
      .eq('id', userId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update privacy' };
  }
}
