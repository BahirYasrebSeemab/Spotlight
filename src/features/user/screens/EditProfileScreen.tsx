
// ========================================
// app/(tabs)/profile/edit-profile.tsx - FIXED Edit Profile
// ========================================
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { InputField } from '@/src/shared/components/InputField';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { useEditProfile } from '@/src/features/user/hooks/useEditUser';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
  const authUser = useAppSelector(state => state.auth.user);
  const router = useRouter();

  // Fetch full profile data
  const { data: profile, isLoading: profileLoading } = useUserProfile(authUser?.id);

  const { name, setName, username, setUsername, bio, setBio, avatarUrl, pickAvatar, submit, loading, error } =
    useEditProfile(authUser?.id || '', {
      name: profile?.name || '',
      username: profile?.username || '',
      avatarUrl: profile?.avatarUrl || '',
      bio: profile?.bio || '',
    });

  // Loading state
  if (profileLoading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  const handleAvatarPress = async () => {
    await pickAvatar();
  };

  const handleSave = async () => {
    const success = await submit();
    if (success) {
      Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    }
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
        <TouchableOpacity onPress={handleAvatarPress} disabled={loading} className="mb-8 self-center">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-32 h-32 rounded-full bg-gray-300" />
          ) : (
            <View className="w-32 h-32 rounded-full bg-purple-500 items-center justify-center">
              <Text className="text-white text-5xl font-bold">{profile.name?.[0] || profile.username?.[0] || '?'}</Text>
            </View>
          )}
          <Text className="text-center text-blue-500 dark:text-blue-400 mt-2">Change Avatar</Text>
        </TouchableOpacity>

        <View className="w-full max-w-md">
          {/* Name */}
          <InputField label="Full Name" value={name} onChangeText={setName} editable={!loading} />

          {/* Username */}
          <InputField
            label="Username"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            editable={!loading}
          />

          {/* Bio */}
          <InputField
            label="Bio"
            multiline
            value={bio}
            onChangeText={setBio}
            style={{ height: 100, textAlignVertical: 'top' }}
            editable={!loading}
          />

          {/* Error message */}
          {error && (
            <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">
              <Text className="text-red-600 dark:text-red-400 text-center">{error}</Text>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`w-full py-3 rounded-xl mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-500 dark:bg-blue-600'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-semibold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
