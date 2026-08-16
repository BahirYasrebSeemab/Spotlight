import { useQueryClient, useMutation } from '@tanstack/react-query';

import { UpdateUserPayload } from '@/src/shared/types/user.types';
import { updateUser, uploadAvatarToSupabase } from '@/src/features/user/services/user.services';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const uploadAvatar = useMutation({
    mutationFn: async ({ uri, userId }: { userId: string; uri: string }) => {
      return uploadAvatarToSupabase(userId, uri);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ payload, userId }: { userId: string; payload: UpdateUserPayload }) => {
      const { data, error } = await updateUser(userId, payload);
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user-profile', variables.userId],
      });
    },
  });

  return {
    error: uploadAvatar.error || updateProfile.error,
    isUpdating: updateProfile.isPending,
    isUploading: uploadAvatar.isPending,
    updateProfile: updateProfile.mutateAsync,
    uploadAvatar: uploadAvatar.mutateAsync,
  };
}
