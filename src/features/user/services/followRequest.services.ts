import { supabase } from '@/src/lib/supabase';
// ========================================
// src/features/user/services/follow-request.service.ts
// ========================================

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

// Send a follow request (for private accounts)
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

// Accept a follow request
export async function acceptFollowRequest(requestId: string) {
  try {
    const { error } = await supabase
      .from('FollowRequest')
      .update({ status: 'accepted', updatedAt: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;

    // The database trigger will automatically create the Follower relationship
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to accept follow request' };
  }
}

// Reject a follow request
export async function rejectFollowRequest(requestId: string) {
  try {
    const { error } = await supabase
      .from('FollowRequest')
      .update({ status: 'rejected', updatedAt: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (err: any) {
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

    // Flatten structure
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

    // Flatten structure
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

    if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to check request status' };
  }
}
