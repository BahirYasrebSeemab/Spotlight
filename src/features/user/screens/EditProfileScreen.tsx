import { View, Text, TouchableOpacity, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useEditProfile } from '@/src/features/user/hooks/useEditUser';

export default function EditProfileScreen() {
  const { user } = useAppSelector(state => state.user);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-gray-500 dark:text-gray-300">Loading...</Text>
      </View>
    );
  }

  const { name, setName, username, setUsername, bio, setBio, avatarUrl, pickAvatar, submit, loading, error } =
    useEditProfile(user.id, {
      name: user.fullName,
      username: user.username,
      avatarUrl: user.avatar,
    });

  const handleAvatarPress = async () => {
    const file = await pickAvatar();
    // file is handled internally
  };

  const handleSave = async () => {
    const success = await submit();
    // maybe add toast? idc for now
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-white dark:bg-black"
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-center px-8 py-12">
        {/* Title */}
        <Text className="text-3xl font-extrabold text-center text-black dark:text-white mb-10">Edit Profile</Text>

        {/* Avatar */}
        <TouchableOpacity onPress={handleAvatarPress} className="mb-8 self-center">
          <Image
            source={avatarUrl ? { uri: avatarUrl } : { uri: 'https://placehold.co/200x200?text=Avatar' }}
            className="w-32 h-32 rounded-full bg-gray-300"
          />
          <Text className="text-center text-blue-500 mt-2">Change Avatar</Text>
        </TouchableOpacity>

        <View className="w-full max-w-md">
          {/* Name */}
          <InputField label="Full Name" value={name} onChangeText={setName} />

          {/* Username */}
          <InputField label="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />

          {/* Bio */}
          <InputField
            label="Bio"
            multiline
            value={bio}
            onChangeText={setBio}
            style={{ height: 100, textAlignVertical: 'top' }}
          />

          {/* Error message */}
          {error && <Text className="text-red-500 text-center mb-2">{error}</Text>}

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`w-full py-3 rounded-xl mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
