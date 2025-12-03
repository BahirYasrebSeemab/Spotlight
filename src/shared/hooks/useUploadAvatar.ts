import { useState } from 'react';
import { Image } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/src/lib/supabase';

export function useUploadAvatar() {
  const [loading, setLoading] = useState(false);

  const uploadAvatar = async (userId: string, uri: string): Promise<string | null> => {
    try {
      setLoading(true);

      // ✅ 1. Make sure session is fresh
      await supabase.auth.refreshSession();

      // Wait 200ms because React Native is slow with session hydration
      await new Promise(res => setTimeout(res, 200));

      // Log session to confirm UID exists
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log('UPLOAD SESSION UID:', session?.user?.id);

      if (!session?.user?.id) {
        throw new Error('Auth session not ready during avatar upload');
      }

      // ✅ 2. Compress image
      const compressedUri = await Image.compress(uri, {
        compressionMethod: 'manual',
        quality: 0.7,
      });

      const info = await FileSystem.getInfoAsync(compressedUri);
      if (!info.exists) throw new Error('Compressed file not found');

      // Example: avatars/<uid>/<uid>.webp
      const filename = `${userId}.webp`;
      const path = `${userId}/${filename}`;

      // Convert to Blob
      const blob = await (await fetch(compressedUri)).blob();

      // ❗ NO UPSERT — RLS UPDATE breaks "network request failed"
      const { data, error } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: 'image/webp',
      });

      if (error) {
        console.error('STORAGE ERROR:', error);
        throw error;
      }

      // Get public URL
      const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(path);

      return publicData.publicUrl;
    } catch (err: any) {
      console.log('UPLOAD AVATAR ERROR:', err.message || err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadAvatar, loading };
}
