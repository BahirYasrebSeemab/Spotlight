import { useState } from 'react';
import { Image } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/src/lib/supabase';

export function useUploadAvatar() {
  const [loading, setLoading] = useState(false);

  const uploadAvatar = async (userId: string, uri: string): Promise<string | null> => {
    
    try {
      setLoading(true);

      const compressedUri = await Image.compress(uri, {
        compressionMethod: 'manual',
        quality: 0.7,
      });

      const info = await FileSystem.getInfoAsync(compressedUri);
      if (!info.exists) throw new Error('Compressed file missing');

      const filename = `${userId}.webp`;
      const path = `${userId}/${filename}`;

      const blob = await (await fetch(compressedUri)).blob();

      const { error } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: 'image/webp',
        upsert: true,
      });

      if (error) throw error;

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.log('UPLOAD AVATAR ERROR:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadAvatar, loading };
}
