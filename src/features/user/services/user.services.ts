import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';

import { supabase } from '@/src/lib/supabase';
import { UpdateUserPayload, User } from '@/src/shared/types/user.types';

export interface UserProfileData {
  id: string;
  email: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
  bio: string | null;
  localCount: number;
  dob: string | null;
  name: string | null;
  memoriesCount: number;
  tailoredCount: number;
  followersCount: number;
  followingCount: number;
  ownershipsCount: number;
  internationalCount: number;
}

export interface UserMemories {
  id: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  caption: string | null;
  mediaUrl: string | null;
  author: {
    id: string;
    username: string;
    avatarUrl: string;
  };
}

interface InsertResult<T> {
  error: any;
  data: T | null;
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
      name: file.fileName,
      type: file.type,
      uri: file.uri,
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

// Get user profile - ALWAYS returns basic info (name, username, avatar, counts)
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('id, username, name, avatarUrl, bio, isPrivate, followersCount, followingCount, memoriesCount, createdAt')
      .eq('id', userId)
      .single();

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

// Fetch user's memories
export async function getUsersMemories(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Memories')
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
    return { data: null, error: err.message || 'Failed to fetch memories' };
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
        isAuthenticated,
        createdAt,
        originalImageUrl,
        processedImageUrl,
        thumbnailUrl,
        processingStatus,
        prototype:prototypeId (
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
        ),
        communityProduct:communityProductId (
          id,
          name,
          brandName,
          imageUrl,
          category
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
    const { error } = await supabase.from('User').update({ isPrivate }).eq('id', userId);

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update privacy', success: false };
  }
}

export async function deactivateAccount(userId: string) {
  try {
    const { error } = await supabase.from('User').update({ isActive: false }).eq('id', userId);

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to deactivate account', success: false };
  }
}

export async function reactivateAccount(userId: string) {
  try {
    const { error } = await supabase.from('User').update({ isActive: true }).eq('id', userId);

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to reactivate account', success: false };
  }
}
