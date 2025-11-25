import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { updateUser, uploadAvatar } from '@/src/features/user/services/userServices';
import { useValidation } from '@/src/shared/hooks/validation';
import { updateUserLocal } from '../slices/userSlice';

export function useEditProfile(userId: string, defaultValues: any) {
  const [name, setName] = useState(defaultValues.name || '');
  const [username, setUsername] = useState(defaultValues.username || '');
  const [bio, setBio] = useState(defaultValues.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl || '');
  const [loading, setLoading] = useState(false);
  const { validateUsername, error, setError } = useValidation();
  const dispatch = useAppDispatch();

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      setAvatarUrl(file.uri);
      return file;
    }
  };

  const submit = async (avatarFile?: any) => {
    setLoading(true);

    if (!validateUsername(username)) {
      setLoading(false);
      return false;
    }

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(userId, avatarFile);
        if (uploadedUrl) finalAvatarUrl = uploadedUrl;
      }

      const { data, error: updateError } = await updateUser(userId, {
        name,
        username,
        bio,
        avatarUrl: finalAvatarUrl,
      });

      if (updateError) throw updateError;

      // Update Redux slice correctly
      dispatch(
        updateUserLocal({
          id: data.id,
          email: data.email,
          username: data.username,
          fullName: data.name,
          avatar: data.avatarUrl,
          createdAt: data.createdAt,
        }),
      );

      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
      return false;
    }
  };


  return {
    name,
    setName,
    username,
    setUsername,
    bio,
    setBio,
    avatarUrl,
    setAvatarUrl,
    pickAvatar,
    submit,
    loading,
    error,
  };
}
