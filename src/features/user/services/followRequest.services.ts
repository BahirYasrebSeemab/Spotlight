// ========================================
// src/features/user/services/followRequest.services.ts - FIXED
// ========================================
import { supabase } from '@/src/lib/supabase';

export interface FollowRequest {
  id: string;
  requesterId: string;
  requestedId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
  requester?: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
  requested?: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
}

// Send a follow request
export async function sendFollowRequest(requesterId: string, requestedId: string) {
  try {
    const { data, error } = await supabase
      .from('FollowRequest')
      .insert({
        requesterId,
        requestedId,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to send follow request' };
  }
}

// Cancel a follow request
export async function cancelFollowRequest(requesterId: string, requestedId: string) {
  try {
    const { error } = await supabase
      .from('FollowRequest')
      .delete()
      .eq('requesterId', requesterId)
      .eq('requestedId', requestedId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to cancel follow request' };
  }
}

// Accept a follow request - LOGS EVERYTHING
export async function acceptFollowRequest(requestId: string) {
  try {
    console.log('📥 [SERVICE] Starting acceptFollowRequest for:', requestId);

    // Update status to 'accepted'
    const { data, error } = await supabase
      .from('FollowRequest')
      .update({ status: 'accepted', updatedAt: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    console.log('📦 [SERVICE] Update result:', { data, error });

    if (error) {
      console.error('❌ [SERVICE] Update error:', error);
      throw error;
    }

    if (!data) {
      console.error('❌ [SERVICE] No data returned after update');
      throw new Error('Follow request not found');
    }

    console.log('✅ [SERVICE] Status updated to accepted:', data);

    // Give the trigger time to run (if it exists)
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if follower relationship was created by trigger
    const { data: followerCheck, error: checkError } = await supabase
      .from('Follower')
      .select('*')
      .eq('followerId', data.requesterId)
      .eq('followingId', data.requestedId)
      .single();

    console.log('🔍 [SERVICE] Follower relationship check:', { followerCheck, checkError });

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ [SERVICE] Error checking follower:', checkError);
    }

    if (!followerCheck) {
      console.warn('⚠️ [SERVICE] No follower relationship found - trigger might not exist');
    } else {
      console.log('✅ [SERVICE] Follower relationship exists:', followerCheck);
    }

    return { success: true, error: null, data };
  } catch (err: any) {
    console.error('❌ [SERVICE] acceptFollowRequest failed:', err);
    return { success: false, error: err.message || 'Failed to accept follow request' };
  }
}

// Reject a follow request - JUST DELETE
export async function rejectFollowRequest(requestId: string) {
  try {
    console.log('🔴 [SERVICE] Rejecting/deleting request:', requestId);

    const { error } = await supabase.from('FollowRequest').delete().eq('id', requestId);

    if (error) {
      console.error('❌ [SERVICE] Delete error:', error);
      throw error;
    }

    console.log('✅ [SERVICE] Request deleted successfully');
    return { success: true, error: null };
  } catch (err: any) {
    console.error('❌ [SERVICE] rejectFollowRequest failed:', err);
    return { success: false, error: err.message || 'Failed to reject follow request' };
  }
}

// Get pending follow requests (received)
export async function getReceivedFollowRequests(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('FollowRequest')
      .select(
        `
        id,
        requesterId,
        requestedId,
        status,
        createdAt,
        updatedAt,
        requester:requesterId (
          id,
          username,
          name,
          avatarUrl,
          bio
        )
      `,
      )
      .eq('requestedId', userId)
      .eq('status', 'pending')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const requests =
      data?.map(item => ({
        ...item,
        requester: Array.isArray(item.requester) ? item.requester[0] : item.requester,
      })) || [];

    return { data: requests, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch follow requests' };
  }
}

// Get sent follow requests
export async function getSentFollowRequests(userId: string, limit = 20, offset = 0) {
  try {
    const { data, error } = await supabase
      .from('FollowRequest')
      .select(
        `
        id,
        requesterId,
        requestedId,
        status,
        createdAt,
        updatedAt,
        requested:requestedId (
          id,
          username,
          name,
          avatarUrl
        )
      `,
      )
      .eq('requesterId', userId)
      .eq('status', 'pending')
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const requests =
      data?.map(item => ({
        ...item,
        requested: Array.isArray(item.requested) ? item.requested[0] : item.requested,
      })) || [];

    return { data: requests, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch sent requests' };
  }
}

// Check if there's a pending follow request
export async function checkFollowRequestStatus(requesterId: string, requestedId: string) {
  try {
    const { data, error } = await supabase
      .from('FollowRequest')
      .select('id, status')
      .eq('requesterId', requesterId)
      .eq('requestedId', requestedId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to check request status' };
  }
}
