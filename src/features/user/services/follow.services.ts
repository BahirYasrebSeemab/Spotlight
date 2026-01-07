// ========================================
// src/features/user/services/user.services.ts - UPDATED
// ========================================
import { supabase } from '@/src/lib/supabase';

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

// Get user profile - ALWAYS returns basic info (name, username, avatar, counts)
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('User')
      .select('id, username, name, avatarUrl, bio, isPrivate, followersCount, followingCount, postsCount, createdAt')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch user profile' };
  }
}

// ========================================
// src/features/user/services/follow.services.ts - UPDATED
// ========================================

// Get user's followers - RESPECTS PRIVACY
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

    if (error) {
      // If RLS blocks this, it means the account is private and you don't follow them
      if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
        return { data: null, error: 'PRIVATE_ACCOUNT' };
      }
      throw error;
    }

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

// Get user's following - RESPECTS PRIVACY
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

    if (error) {
      // If RLS blocks this, it means the account is private and you don't follow them
      if (error.code === 'PGRST116' || error.message.includes('row-level security')) {
        return { data: null, error: 'PRIVATE_ACCOUNT' };
      }
      throw error;
    }

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

// Unfollow user - AUTOMATICALLY CLEANS UP FOLLOW REQUESTS
export async function unfollowUser(currentUserId: string, targetUserId: string) {
  try {
    console.log('🔴 Unfollowing:', { currentUserId, targetUserId });

    // Delete the follow relationship
    // Trigger will automatically:
    // 1. Update counts
    // 2. Delete any accepted FollowRequest
    const { error } = await supabase
      .from('Follower')
      .delete()
      .eq('followerId', currentUserId)
      .eq('followingId', targetUserId);

    if (error) {
      console.error('❌ Unfollow error:', error);
      throw error;
    }

    console.log('✅ Unfollowed successfully (FollowRequest cleaned up by trigger)');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('❌ Unfollow failed:', err);
    return { success: false, error: err.message || 'Failed to unfollow user' };
  }
}