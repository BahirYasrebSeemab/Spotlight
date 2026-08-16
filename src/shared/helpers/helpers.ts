import * as ImagePicker from 'expo-image-picker';

export function generateUsername(email: string): string {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${base}_${random}`;
}

export const pickAvatar = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.canceled) {
    const file = result.assets[0];
    return { file, uri: file.uri };
  }
};
