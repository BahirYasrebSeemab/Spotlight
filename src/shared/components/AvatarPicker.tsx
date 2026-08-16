import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image, View, TouchableOpacity } from 'react-native';

export interface AvatarPickerProps {
  avatar: string;
  onPick: (uri: string) => void;
}

export const AvatarPicker = ({ avatar, onPick }: AvatarPickerProps) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) onPick(result.assets[0].uri);
  };

  return (
    <TouchableOpacity onPress={pickImage} className="self-center mb-6">
      {avatar ? (
        <Image source={{ uri: avatar }} className="w-24 h-24 rounded-full" />
      ) : (
        <View className="w-24 h-24 rounded-full bg-muted justify-center items-center">
          <Ionicons name="camera-outline" size={30} color="#777" />
        </View>
      )}
    </TouchableOpacity>
  );
};
