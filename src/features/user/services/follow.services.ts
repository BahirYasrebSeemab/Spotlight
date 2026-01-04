import { supabase } from '@/src/lib/supabase';
import { sendFollowRequest } from './followRequest.services';

// ========================================
// src/features/profile/services/follow.service.ts
// ========================================

// Check if current user follows target user
export async function checkFollowStatus(currentUserId: string, targetUserId: string) {
  try {
    const { data, error } = await supabase
      .from('Follower')
      .select('id')
      .eq('followerId', currentUserId)
      .eq('followingId', targetUserId)
      .single();

    return { isFollowing: !!data, error: null };
  } catch (err: any) {
    // Not following if no record found
    return { isFollowing: false, error: null };
  }
}

// Follow a user
export async function followUser(currentUserId: string, targetUserId: string) {
  try {
    // Insert follower relationship
    const { error: insertError } = await supabase.from('Follower').insert({
      followerId: currentUserId,
      followingId: targetUserId,
    });

    if (insertError) throw insertError;

    // Update counts
    await Promise.all([
      supabase.rpc('increment_following_count', { user_id: currentUserId }),
      supabase.rpc('increment_followers_count', { user_id: targetUserId }),
    ]);

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to follow user' };
  }
}

// Get user's followers (spotters)
export async function getUserFollowers(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Follower')
      .select(
        `
        id,
        createdAt,
        follower:followerId (
          id,
          username,
          name,
          avatarUrl,
          bio
        )
      `,
      )
      .eq('followingId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Map to flatten structure and ensure proper typing
    const followers =
      data
        ?.map(item => {
          const follower = Array.isArray(item.follower) ? item.follower[0] : item.follower;
          return follower;
        })
        .filter(Boolean) || [];

    return { data: followers, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch followers' };
  }
}

// Get user's following (spotted)
export async function getUserFollowing(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('Follower')
      .select(
        `
        id,
        createdAt,
        following:followingId (
          id,
          username,
          name,
          avatarUrl,
          bio
        )
      `,
      )
      .eq('followerId', userId)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Map to flatten structure and ensure proper typing
    const following =
      data
        ?.map(item => {
          const user = Array.isArray(item.following) ? item.following[0] : item.following;
          return user;
        })
        .filter(Boolean) || [];

    return { data: following, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch following' };
  }
}

// ========================================
// src/features/user/services/follow.service.ts (UPDATED)
// ========================================

// Check if target user is private
export async function isUserPrivate(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('isPrivate')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.isPrivate || false;
  } catch (err) {
    return false;
  }
}

// Smart follow function - handles both public and private accounts
export async function followUserSmart(currentUserId: string, targetUserId: string) {
  try {
    // Check if target user is private
    const isPrivate = await isUserPrivate(targetUserId);
    
    if (isPrivate) {
      // Send follow request instead
      return await sendFollowRequest(currentUserId, targetUserId);
    } else {
      // Direct follow for public accounts
      const { error } = await supabase
        .from('Follower')
        .insert({
          followerId: currentUserId,
          followingId: targetUserId,
        });

      if (error) throw error;
      return { success: true, error: null };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to follow user' };
  }
}

// Unfollow user (works for both public and private)
export async function unfollowUser(currentUserId: string, targetUserId: string) {
  try {
    // Delete the follow relationship (triggers will handle counts)
    const { error } = await supabase
      .from('Follower')
      .delete()
      .eq('followerId', currentUserId)
      .eq('followingId', targetUserId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to unfollow user' };
  }
}
