// src/features/user/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getUser } from '../services/user.services';
import { User } from '@/src/shared/types/user.types';
import {
  followUserSmart,
  unfollowUser,
  checkFollowStatus,
  getUserFollowers,
  getUserFollowing,
} from '../services/follow.services';
import {
  sendFollowRequest,
  acceptFollowRequest,
  rejectFollowRequest,
  cancelFollowRequest,
  checkFollowRequestStatus,
  getReceivedFollowRequests,
} from '../services/followRequest.services';

// ========================================
// Types
// ========================================

interface FollowRequestData {
  id: string;
  requesterId: string;
  requestedId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  requester?: {
    id: string;
    username: string;
    name: string | null;
    avatarUrl: string;
  };
}

// interface ServicesTypes {
//   success: boolean;

// }

interface UserState {
  // Current user's profile
  user: User | null;
  loading: boolean;
  error: string | null;

  // Visited profiles cache
  visitedProfiles: Record<string, User>;
  profilesLoading: Record<string, boolean>;

  // Follow status cache (key: "currentUserId:targetUserId")
  followStatuses: Record<string, boolean>;
  followLoading: Record<string, boolean>;

  // Follow request status cache
  followRequestStatuses: Record<
    string,
    {
      status: 'pending' | 'accepted' | 'rejected';
      id: string;
    }
  >;
  requestLoading: Record<string, boolean>;

  // Received follow requests
  receivedRequests: FollowRequestData[];
  receivedRequestsLoading: boolean;

  // Followers & Following cache
  followers: Record<string, any[]>;
  following: Record<string, any[]>;
  followersLoading: Record<string, boolean>;
  followingLoading: Record<string, boolean>;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
  visitedProfiles: {},
  profilesLoading: {},
  followStatuses: {},
  followLoading: {},
  followRequestStatuses: {},
  requestLoading: {},
  receivedRequests: [],
  receivedRequestsLoading: false,
  followers: {},
  following: {},
  followersLoading: {},
  followingLoading: {},
};

// ========================================
// Async Thunks
// ========================================

// Fetch current user
export const fetchUser = createAsyncThunk('user/fetchUser', async (id: string, { rejectWithValue }) => {
  const { data, error } = await getUser(id);
  if (error) return rejectWithValue(error.message || 'Failed to load user');
  return data;
});

// Fetch any user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId: string, { rejectWithValue }) => {
    const { data, error } = await getUser(userId);
    if (error) return rejectWithValue(error.message || 'Failed to load profile');
    return { userId, data };
  },
);

// Follow user (smart - handles public/private)
export const followUser = createAsyncThunk(
  'user/followUser',
  async ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }, { rejectWithValue }) => {
    const result = await followUserSmart(currentUserId, targetUserId);
    if (!result.success) return rejectWithValue(result.error || 'Failed to follow');
    return { currentUserId, targetUserId };
  },
);

// Unfollow user
export const unfollowUserThunk = createAsyncThunk(
  'user/unfollowUser',
  async ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }, { rejectWithValue }) => {
    const result = await unfollowUser(currentUserId, targetUserId);
    if (!result.success) return rejectWithValue(result.error || 'Failed to unfollow');
    return { currentUserId, targetUserId };
  },
);

// Check follow status
export const checkFollowStatusThunk = createAsyncThunk(
  'user/checkFollowStatus',
  async ({ currentUserId, targetUserId }: { currentUserId: string; targetUserId: string }, { rejectWithValue }) => {
    const { isFollowing, error } = await checkFollowStatus(currentUserId, targetUserId);
    if (error) return rejectWithValue(error);
    return { currentUserId, targetUserId, isFollowing };
  },
);

// Accept follow request
export const acceptFollowRequestThunk = createAsyncThunk(
  'user/acceptFollowRequest',
  async (requestId: string, { rejectWithValue }) => {
    const result = await acceptFollowRequest(requestId);
    if (!result.success) return rejectWithValue(result.error || 'Failed to accept');
    return requestId;
  },
);

// Reject follow request
export const rejectFollowRequestThunk = createAsyncThunk(
  'user/rejectFollowRequest',
  async (requestId: string, { rejectWithValue }) => {
    const result = await rejectFollowRequest(requestId);
    if (!result.success) return rejectWithValue(result.error || 'Failed to reject');
    return requestId;
  },
);

// Cancel follow request
export const cancelFollowRequestThunk = createAsyncThunk(
  'user/cancelFollowRequest',
  async ({ requesterId, requestedId }: { requesterId: string; requestedId: string }, { rejectWithValue }) => {
    const result = await cancelFollowRequest(requesterId, requestedId);
    if (!result.success) return rejectWithValue(result.error || 'Failed to cancel');
    return { requesterId, requestedId };
  },
);

// Fetch received follow requests
export const fetchReceivedFollowRequests = createAsyncThunk(
  'user/fetchReceivedRequests',
  async (userId: string, { rejectWithValue }) => {
    const { data, error } = await getReceivedFollowRequests(userId);
    if (error) return rejectWithValue(error);
    return data || [];
  },
);

// Check follow request status
export const checkFollowRequestStatusThunk = createAsyncThunk(
  'user/checkFollowRequestStatus',
  async ({ requesterId, requestedId }: { requesterId: string; requestedId: string }, { rejectWithValue }) => {
    const { data, error } = await checkFollowRequestStatus(requesterId, requestedId);
    if (error) return rejectWithValue(error);
    return { requesterId, requestedId, data };
  },
);

// Fetch followers
export const fetchFollowers = createAsyncThunk('user/fetchFollowers', async (userId: string, { rejectWithValue }) => {
  const { data, error } = await getUserFollowers(userId);
  if (error) return rejectWithValue(error);
  return { userId, data: data || [] };
});

// Fetch following
export const fetchFollowing = createAsyncThunk('user/fetchFollowing', async (userId: string, { rejectWithValue }) => {
  const { data, error } = await getUserFollowing(userId);
  if (error) return rejectWithValue(error);
  return { userId, data: data || [] };
});

// ========================================
// Slice
// ========================================

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Update current user locally
    updateUserLocal(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },

    // Clear all cached data
    clearCache(state) {
      state.visitedProfiles = {};
      state.followStatuses = {};
      state.followRequestStatuses = {};
      state.followers = {};
      state.following = {};
    },

    // Optimistically update follow status
    optimisticFollow(state, action: PayloadAction<{ currentUserId: string; targetUserId: string }>) {
      const key = `${action.payload.currentUserId}:${action.payload.targetUserId}`;
      state.followStatuses[key] = true;
      state.followLoading[key] = true;

      // Update counts optimistically
      if (state.user?.id === action.payload.currentUserId) {
        state.user.followingCount = (state.user.followingCount || 0) + 1;
      }

      const targetProfile = state.visitedProfiles[action.payload.targetUserId];
      if (targetProfile) {
        targetProfile.followersCount = (targetProfile.followersCount || 0) + 1;
      }
    },

    // Optimistically update unfollow status
    optimisticUnfollow(state, action: PayloadAction<{ currentUserId: string; targetUserId: string }>) {
      const key = `${action.payload.currentUserId}:${action.payload.targetUserId}`;
      state.followStatuses[key] = false;
      state.followLoading[key] = true;

      // Update counts optimistically
      if (state.user?.id === action.payload.currentUserId) {
        state.user.followingCount = Math.max((state.user.followingCount || 0) - 1, 0);
      }

      const targetProfile = state.visitedProfiles[action.payload.targetUserId];
      if (targetProfile) {
        targetProfile.followersCount = Math.max((targetProfile.followersCount || 0) - 1, 0);
      }
    },
  },
  extraReducers: builder => {
    // Fetch current user
    builder
      .addCase(fetchUser.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch user profile
    builder
      .addCase(fetchUserProfile.pending, (state, action) => {
        state.profilesLoading[action.meta.arg] = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profilesLoading[action.payload.userId] = false;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profilesLoading[action.meta.arg] = false;
      });

    // Follow user
    builder
      .addCase(followUser.pending, (state, action) => {
        const key = `${action.meta.arg.currentUserId}:${action.meta.arg.targetUserId}`;
        state.followLoading[key] = true;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        const key = `${action.payload.currentUserId}:${action.payload.targetUserId}`;
        state.followLoading[key] = false;
        state.followStatuses[key] = true;

        // Update counts
        if (state.user?.id === action.payload.currentUserId) {
          state.user.followingCount = (state.user.followingCount || 0) + 1;
        }

        const targetProfile = state.visitedProfiles[action.payload.targetUserId];
        if (targetProfile) {
          targetProfile.followersCount = (targetProfile.followersCount || 0) + 1;
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        const key = `${action.meta.arg.currentUserId}:${action.meta.arg.targetUserId}`;
        state.followLoading[key] = false;
        // Revert optimistic update
        state.followStatuses[key] = false;
      });

    // Unfollow user
    builder
      .addCase(unfollowUserThunk.pending, (state, action) => {
        const key = `${action.meta.arg.currentUserId}:${action.meta.arg.targetUserId}`;
        state.followLoading[key] = true;
      })
      .addCase(unfollowUserThunk.fulfilled, (state, action) => {
        const key = `${action.payload.currentUserId}:${action.payload.targetUserId}`;
        state.followLoading[key] = false;
        state.followStatuses[key] = false;

        // Update counts
        if (state.user?.id === action.payload.currentUserId) {
          state.user.followingCount = Math.max((state.user.followingCount || 0) - 1, 0);
        }

        const targetProfile = state.visitedProfiles[action.payload.targetUserId];
        if (targetProfile) {
          targetProfile.followersCount = Math.max((targetProfile.followersCount || 0) - 1, 0);
        }
      })
      .addCase(unfollowUserThunk.rejected, (state, action) => {
        const key = `${action.meta.arg.currentUserId}:${action.meta.arg.targetUserId}`;
        state.followLoading[key] = false;
        // Revert optimistic update
        state.followStatuses[key] = true;
      });

    // Check follow status
    builder.addCase(checkFollowStatusThunk.fulfilled, (state, action) => {
      const key = `${action.payload.currentUserId}:${action.payload.targetUserId}`;
      state.followStatuses[key] = action.payload.isFollowing;
    });

    // Accept follow request
    builder.addCase(acceptFollowRequestThunk.fulfilled, (state, action) => {
      state.receivedRequests = state.receivedRequests.filter(r => r.id !== action.payload);
      // Increment followers count
      if (state.user) {
        state.user.followersCount = (state.user.followersCount || 0) + 1;
      }
    });

    // Reject follow request
    builder.addCase(rejectFollowRequestThunk.fulfilled, (state, action) => {
      state.receivedRequests = state.receivedRequests.filter(r => r.id !== action.payload);
    });

    // Cancel follow request
    builder.addCase(cancelFollowRequestThunk.fulfilled, (state, action) => {
      const key = `${action.payload.requesterId}:${action.payload.requestedId}`;
      delete state.followRequestStatuses[key];
      state.requestLoading[key] = false;
    });

    // Fetch received requests
    builder
      .addCase(fetchReceivedFollowRequests.pending, state => {
        state.receivedRequestsLoading = true;
      })
      .addCase(fetchReceivedFollowRequests.fulfilled, (state, action) => {
        state.receivedRequestsLoading = false;
        state.receivedRequests = action.payload;
      })
      .addCase(fetchReceivedFollowRequests.rejected, state => {
        state.receivedRequestsLoading = false;
      });

    // Check follow request status
    builder.addCase(checkFollowRequestStatusThunk.fulfilled, (state, action) => {
      const key = `${action.payload.requesterId}:${action.payload.requestedId}`;
      if (action.payload.data) {
        state.followRequestStatuses[key] = {
          status: action.payload.data.status,
          id: action.payload.data.id,
        };
      }
    });

    // Fetch followers
    builder
      .addCase(fetchFollowers.pending, (state, action) => {
        state.followersLoading[action.meta.arg] = true;
      })
      .addCase(fetchFollowers.fulfilled, (state, action) => {
        state.followersLoading[action.payload.userId] = false;
        state.followers[action.payload.userId] = action.payload.data;
      })
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.followersLoading[action.meta.arg] = false;
      });

    // Fetch following
    builder
      .addCase(fetchFollowing.pending, (state, action) => {
        state.followingLoading[action.meta.arg] = true;
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.followingLoading[action.payload.userId] = false;
        state.following[action.payload.userId] = action.payload.data;
      })
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.followingLoading[action.meta.arg] = false;
      });
  },
});

export const { updateUserLocal, clearCache, optimisticFollow, optimisticUnfollow } = userSlice.actions;

export default userSlice.reducer;
