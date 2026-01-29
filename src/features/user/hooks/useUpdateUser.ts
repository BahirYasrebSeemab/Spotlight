import { updateUser, uploadAvatarToSupabase } from '../services/user.services';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '@/src/features/auth/slices/authSlice';
import { UpdateUserPayload, UserProfile } from '@/src/shared/types/user.types';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { isPending } from '@reduxjs/toolkit';

export function useUpdateUser() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const uploadAvatarMutation = useMutation({
    mutationFn: async (data: { userId: string; file: File; uri: string }) => {
      const { userId, file, uri } = data;
      if (file && uri.startsWith('file://')) {
        try {
          const publicUrl = await uploadAvatarToSupabase(userId, uri);
          return publicUrl;
        } catch (err: any) {
          return err.message;
        }
      }
    },

    onMutate: async data => {
      await queryClient.cancelQueries({
        queryKey: ['user-profile', data.userId],
      });
    },

    onSuccess: async (publicUrl, data) => {
      await queryClient.invalidateQueries({
        queryKey: ['user-profile', data.userId],
      });
      return { publicUrl };
    },

    onError: error => {
      console.error('Avatar upload failed:', error);
    },
  });

  
  const submitMutation = useMutation({
    mutationFn: async (data: { userId: string; payload: UpdateUserPayload }) => {
      const { userId, payload } = data;
      const { data: updatedUser, error } = await updateUser(userId, payload);
      if (!error && updatedUser) dispatch(setCurrentUser(updatedUser));
      return { data: updatedUser, error };
    },
    onMutate: async data => {
      await queryClient.cancelQueries({
        queryKey: ['user-profile', data.userId],
      });
    },

    onSuccess: async (result, data) => {
      await queryClient.invalidateQueries({
        queryKey: ['user-profile', data.userId],
      });
      return result.data;
    },
    onError: error => {
      console.error('User update failed:', error);
    },
  });

  return {
    submit: submitMutation.mutateAsync,
    isPending: submitMutation.isPending,
    error: submitMutation.error,
    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploading: uploadAvatarMutation.isPending,
  };
}
