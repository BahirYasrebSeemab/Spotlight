import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/src/lib/supabase';
import { Buffer } from 'buffer';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // HARD CODED USER ID FOR TESTING
  const userId = '7f9a9975-1d25-429a-a9a7-50f96d9dc5de';

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;
    setUploading(true);

    try {
      const fileUri = image;

      // Read file as BASE64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 → Uint8Array using Buffer
      const bytes = Buffer.from(base64, 'base64');

      const ext = fileUri.split('.').pop() ?? 'jpg';
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage.from('avatars').upload(filePath, bytes, {
        contentType: `image/${ext}`,
        upsert: true,
      });

      if (error) {
        console.log('Upload error:', error);
      } else {
        console.log('Uploaded successfully:', filePath);
      }
    } catch (err) {
      console.log('Upload exception:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-bold text-dark dark:text-white">Home</Text>
      <View className="h-[1px] w-4/5 my-8 bg-[#eee] dark:bg-zinc-900" />

      {image && (
        <Image source={{ uri: image }} style={{ width: 150, height: 150, borderRadius: 12, marginBottom: 16 }} />
      )}

      <TouchableOpacity onPress={pickImage} className="py-3 px-6 bg-blue-500 rounded-xl">
        <Text className="text-white">Pick Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={uploadImage}
        disabled={!image || uploading}
        className="mt-4 py-3 px-6 bg-green-500 rounded-xl"
      >
        {uploading ? <ActivityIndicator color="#fff" /> : <Text className="text-white">Upload</Text>}
      </TouchableOpacity>

      <View className="mt-6 mx-5 items-center">
        <Text className="text-center text-blue-500 dark:text-white">this is home page</Text>
      </View>
    </View>
  );
}
