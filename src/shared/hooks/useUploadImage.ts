import { useState } from 'react';
import { Image } from 'react-native-compressor';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/src/lib/supabase';
import { v4 as uuid } from 'uuid';

type UploadOptions = {
  bucket: string;
  folder: string;
  quality?: number;
};

export function useUploadImage() {
  const [loading, setLoading] = useState(false);

  const uploadImage = async (uri: string, options: UploadOptions): Promise<string | null> => {
    try {
      setLoading(true);
      const { bucket, folder, quality = 0.7 } = options;

      // 1️⃣ Compress
      const compressed = await Image.compress(uri, {
        compressionMethod: 'manual',
        quality,
      });

      // 2️⃣ Read as file URI
      const fileInfo = await FileSystem.getInfoAsync(compressed);
      if (!fileInfo.exists) throw new Error('Compressed file does not exist');

      // 3️⃣ Generate filename
      const extension = compressed.includes('.png') ? 'png' : 'webp';
      const filename = `${uuid()}.${extension}`;
      const path = `${folder}/${filename}`;

      // 4️⃣ Read file as binary
      const fileBlob = await (await fetch(compressed)).blob();

      // 5️⃣ Upload
      const { error } = await supabase.storage.from(bucket).upload(path, fileBlob, {
        contentType: extension === 'png' ? 'image/png' : 'image/webp',
      });

      if (error) throw error;

      // 6️⃣ Get public URL
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.log('UPLOAD IMAGE ERROR:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { uploadImage, loading };
}
