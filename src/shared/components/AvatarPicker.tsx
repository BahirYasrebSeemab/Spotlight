import * as ImagePicker from 'expo-image-picker';
import { Image, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AvatarPickerProps {
  avatar: string;
  onPick: (uri: string) => void;
}

export const AvatarPicker = ({ avatar, onPick }: AvatarPickerProps) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) onPick(result.assets[0].uri);
  };

  return (
    <TouchableOpacity onPress={pickImage} className="self-center mb-6">
      {avatar ? (
        <Image source={{ uri: avatar }} className="w-24 h-24 rounded-full" />
      ) : (
        <View className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-800 justify-center items-center">
          <Ionicons name="camera-outline" size={30} color="#777" />
        </View>
      )}
    </TouchableOpacity>
  );
};
