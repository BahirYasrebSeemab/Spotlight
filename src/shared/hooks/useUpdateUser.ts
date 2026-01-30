import { updateUser, uploadAvatarToSupabase } from '@/src/features/user/services/user.services';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { UpdateUserPayload } from '@/src/shared/types/user.types';

export function useUpdateUser() {
  const queryClient = useQueryClient();

  const uploadAvatar = useMutation({
    mutationFn: async ({ userId, uri }: { userId: string; uri: string }) => {
      return uploadAvatarToSupabase(userId, uri);
    },
  });

  const updateProfile = useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) => {
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
    uploadAvatar: uploadAvatar.mutateAsync,
    updateProfile: updateProfile.mutateAsync,
    isUploading: uploadAvatar.isPending,
    isUpdating: updateProfile.isPending,
    error: uploadAvatar.error || updateProfile.error,
  };
}
