import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useValidation } from '@/src/shared/hooks/validation';
import { useUpdateUser } from '@/src/shared/hooks/useUpdateUser';

type Defaults = {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

export function useEditProfile(userId: string, defaults: Defaults) {
  const [name, setName] = useState(defaults.name);
  const [username, setUsername] = useState(defaults.username);
  const [bio, setBio] = useState(defaults.bio);
  const [avatarUrl, setAvatarUrl] = useState(defaults.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<string | null>(null);

  const { validateUsername, error, setError } = useValidation();
  const { uploadAvatar, updateProfile, isUpdating, isUploading } = useUpdateUser();

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
      setAvatarFile(result.assets[0].uri);
    }
  };

  const submit = async () => {
    setError(null);

    if (!validateUsername(username)) return false;

    try {
      let finalAvatar = avatarUrl;

      if (avatarFile && avatarFile.startsWith('file://')) {
        finalAvatar = await uploadAvatar({ userId, uri: avatarFile });
      }

      const payload: any = {};
      if (name !== defaults.name) payload.name = name;
      if (username !== defaults.username) payload.username = username;
      if (bio !== defaults.bio) payload.bio = bio;
      if (finalAvatar !== defaults.avatarUrl) payload.avatarUrl = finalAvatar;

      if (Object.keys(payload).length === 0) return true;

      await updateProfile({ userId, payload });
      return true;
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
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
    loading: isUpdating || isUploading,
    error,
  };
}
