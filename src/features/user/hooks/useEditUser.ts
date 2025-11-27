import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch } from '@/src/shared/hooks/redux';
import { updateUser } from '@/src/features/user/services/userServices';
import { useValidation } from '@/src/shared/hooks/validation';
import { updateUserLocal } from '../slices/userSlice';
import { useRouter } from 'expo-router';
import { useUploadImage } from '@/src/shared/hooks/useUploadImage';

export function useEditProfile(userId: string, defaultValues: any) {
  const [name, setName] = useState(defaultValues.name || '');
  const [username, setUsername] = useState(defaultValues.username || '');
  const [bio, setBio] = useState(defaultValues.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const { validateUsername, error, setError } = useValidation();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { uploadImage } = useUploadImage();

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
      setAvatarFile(file);
      return file;
    }
  };

  const submit = async () => {
    setLoading(true);
    setError(null);

    if (!validateUsername(username)) {
      setLoading(false);
      return false;
    }

    try {
      let finalAvatar = avatarUrl;

      // 🔥 compress + upload avatar
      if (avatarFile) {
        const uploaded = await uploadImage(avatarFile.uri, {
          bucket: 'media',
          folder: `profiles/${userId}`,
        });

        if (uploaded) finalAvatar = uploaded;
      }

      const payload: any = {};

      if (name !== defaultValues.name) payload.name = name;
      if (username !== defaultValues.username) payload.username = username;
      if (bio !== defaultValues.bio) payload.bio = bio;
      if (finalAvatar !== defaultValues.avatarUrl) payload.avatarUrl = finalAvatar;

      const { data, error: updateErr } = await updateUser(userId, payload);
      if (updateErr) throw updateErr;

      dispatch(
        updateUserLocal({
          id: data.id,
          email: data.email,
          username: data.username,
          name: data.name,
          avatar: data.avatarUrl,
          bio: data.bio,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }),
      );

      router.back();

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
    pickAvatar,
    submit,
    loading,
    error,
  };
}
