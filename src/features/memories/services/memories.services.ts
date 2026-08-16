import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';

import type {
  Memory,
  Comment,
  CreateMemoryInput,
  CreateCommentInput,
} from '@/src/features/memories/types/memories.types';

import { supabase } from '@/src/lib/supabase';

interface MemoryItemInsert {
  memoryId: string;
  ownershipId: string;
}

// ============================================
// MEMORY CRUD
// ============================================

/**
 * Upload memory media to Supabase Storage
 */
export async function uploadMemoryMedia(userId: string, uri: string, type: 'photo' | 'video'): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const bytes = Buffer.from(base64, 'base64');
    const ext = uri.split('.').pop() ?? (type === 'photo' ? 'jpg' : 'mp4');
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('memories').upload(filePath, bytes, {
      contentType: type === 'photo' ? `image/${ext}` : `video/${ext}`,
      upsert: false,
    });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err: any) {
    console.error('uploadMemoryMedia error:', err);
    throw new Error('Failed to upload media');
  }
}

/**
 * Create a new memory with tagged items
 */
export async function createMemory(input: CreateMemoryInput) {
  try {
    // Upload media
    const mediaUrl = await uploadMemoryMedia(input.userId, input.mediaUrl, input.mediaType);

    // Upload thumbnail if provided
    let thumbnailUrl: string | null = null;
    if (input.thumbnailUrl) {
      thumbnailUrl = await uploadMemoryMedia(input.userId, input.thumbnailUrl, 'photo');
    }

    // Create memory
    const { data: memory, error: memoryError } = await supabase
      .from('Memory')
      .insert({
        caption: input.caption,
        location: input.location,
        mediaType: input.mediaType,
        mediaUrl,
        takenAt: new Date().toISOString(),
        thumbnailUrl,
        title: input.title,
        userId: input.userId,
      })
      .select()
      .single();

    if (memoryError) throw memoryError;

    // Create memory items (tag ownerships)
    if (input.ownershipIds.length > 0) {
      const memoryItems: MemoryItemInsert[] = input.ownershipIds.map(ownershipId => ({
        memoryId: memory.id,
        ownershipId,
      }));

      const { error: itemsError } = await supabase.from('MemoryItem').insert(memoryItems);

      if (itemsError) throw itemsError;
    }

    return { data: memory as Memory, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to create memory' };
  }
}

/**
 * Get memory by ID with full details
 */
export async function getMemoryById(memoryId: string, currentUserId?: string) {
  try {
    const { data: memory, error: memoryError } = await supabase
      .from('Memory')
      .select(
        `
          *,
          user:userId (
            id,
            username,
            name,
            avatarUrl
          ),
          items:MemoryItem (
            id,
            memoryId,
            ownershipId,
            ownership:ownershipId (
              id,
              processedImageUrl,
              thumbnailImageUrl,
              prototype:prototypeId (
                id,
                name,
                imageUrl,
                thumbnailUrl,
                brand:brandId (
                  id,
                  name
                )
              ),
              communityProduct:communityProductId (
                id,
                name,
                brandName,
                imageUrl,
                thumbnailUrl
              )
            )
          )
        `,
      )
      .eq('id', memoryId)
      .single();

    if (memoryError) throw memoryError;

    // Check if current user liked this memory
    let isLiked = false;
    if (currentUserId) {
      const { data: likeData } = await supabase
        .from('Like')
        .select('id')
        .eq('memoryId', memoryId)
        .eq('userId', currentUserId)
        .single();

      isLiked = !!likeData;
    }

    return {
      data: {
        ...(memory as Memory),
        isLiked,
      } as Memory,
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch memory' };
  }
}

/**
 * Get user's memories
 */
export async function getUserMemories(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Memory')
      .select(
        `
        *,
        user:userId (
          id,
          username,
          name,
          avatarUrl
        )
      `,
      )
      .eq('userId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data as Memory[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch memories' };
  }
}

/**
 * Delete memory
 */
export async function deleteMemory(memoryId: string, userId: string) {
  try {
    const { error } = await supabase.from('Memory').delete().eq('id', memoryId).eq('userId', userId);

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete memory', success: false };
  }
}

// ============================================
// LIKES
// ============================================

/**
 * Like a memory
 */
export async function likeMemory(userId: string, memoryId: string) {
  try {
    const { error } = await supabase.from('Like').insert({
      memoryId,
      userId,
    });

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to like memory', success: false };
  }
}

/**
 * Unlike a memory
 */
export async function unlikeMemory(userId: string, memoryId: string) {
  try {
    const { error } = await supabase.from('Like').delete().eq('userId', userId).eq('memoryId', memoryId);

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to unlike memory', success: false };
  }
}

/**
 * Check if user liked memory
 */
export async function checkLikeStatus(userId: string, memoryId: string) {
  try {
    const { data, error } = await supabase
      .from('Like')
      .select('id')
      .eq('userId', userId)
      .eq('memoryId', memoryId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      data: { isLiked: !!data },
      error: null,
    };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to check like status' };
  }
}

// ============================================
// COMMENTS
// ============================================

/**
 * Get comments for a memory
 */
export async function getMemoryComments(memoryId: string, limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Comment')
      .select(
        `
        *,
        user:userId (
          id,
          username,
          name,
          avatarUrl
        )
      `,
      )
      .eq('memoryId', memoryId)
      .order('createdAt', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data as Comment[], error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch comments' };
  }
}

/**
 * Add comment to memory
 */
export async function addComment(input: CreateCommentInput) {
  try {
    const { data, error } = await supabase
      .from('Comment')
      .insert({
        content: input.content,
        memoryId: input.memoryId,
        userId: input.userId,
      })
      .select(
        `
        *,
        user:userId (
          id,
          username,
          name,
          avatarUrl
        )
      `,
      )
      .single();

    if (error) throw error;
    return { data: data as Comment, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to add comment' };
  }
}

/**
 * Delete comment
 */
export async function deleteComment(commentId: string, userId: string) {
  try {
    const { error } = await supabase.from('Comment').delete().eq('id', commentId).eq('userId', userId);

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete comment', success: false };
  }
}

/**
 * Update comment
 */
export async function updateComment(commentId: string, userId: string, content: string) {
  try {
    const { error } = await supabase.from('Comment').update({ content }).eq('id', commentId).eq('userId', userId);

    if (error) throw error;
    return { error: null, success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update comment', success: false };
  }
}
