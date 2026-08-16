import { useState } from 'react';
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

  const { error, setError, validateUsername } = useValidation();
  const { isUpdating, isUploading, updateProfile, uploadAvatar } = useUpdateUser();

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
        finalAvatar = await uploadAvatar({ uri: avatarFile, userId });
      }

      const payload: any = {};
      if (name !== defaults.name) payload.name = name;
      if (username !== defaults.username) payload.username = username;
      if (bio !== defaults.bio) payload.bio = bio;
      if (finalAvatar !== defaults.avatarUrl) payload.avatarUrl = finalAvatar;

      if (Object.keys(payload).length === 0) return true;

      await updateProfile({ payload, userId });
      return true;
    } catch (e: any) {
      setError(e.message || 'Failed to update profile');
      return false;
    }
  };

  return {
    avatarUrl,
    bio,
    error,
    loading: isUpdating || isUploading,
    name,
    pickAvatar,
    setBio,
    setName,
    setUsername,
    submit,
    username,
  };
}
