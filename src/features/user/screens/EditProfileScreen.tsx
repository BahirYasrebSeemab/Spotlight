// ========================================
// app/(tabs)/profile/edit-profile.tsx - FIXED Edit Profile
// ========================================
import { useRouter } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';

import { useAppSelector } from '@/src/shared/hooks/redux';
import { InputField } from '@/src/shared/components/InputField';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { useEditProfile } from '@/src/features/user/hooks/useEditUser';

export default function EditProfileScreen() {
  const authUser = useAppSelector(state => state.auth.user);
  const router = useRouter();

  // Fetch full profile data
  const { data: profile, isLoading: profileLoading } = useUserProfile(authUser?.id);

  const { avatarUrl, bio, error, loading, name, pickAvatar, setBio, setName, setUsername, submit, username } =
    useEditProfile(authUser?.id || '', {
      avatarUrl: profile?.avatarUrl || '',
      bio: profile?.bio || '',
      name: profile?.name || '',
      username: profile?.username || '',
    });

  // Loading state
  if (profileLoading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
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
      Alert.alert('Success', 'Profile updated successfully!', [{ onPress: () => router.back(), text: 'OK' }]);
    }
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1 bg-background"
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View className="flex-1 items-center px-8 py-12">
        {/* Title */}
        <Text className="text-3xl font-extrabold text-center text-foreground mb-10">Edit Profile</Text>

        {/* Avatar */}
        <TouchableOpacity onPress={handleAvatarPress} disabled={loading} className="mb-8 self-center">
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} className="w-32 h-32 rounded-full bg-gray-300" />
          ) : (
            <View className="w-32 h-32 rounded-full bg-purple-500 items-center justify-center">
              <Text className="text-white text-5xl font-bold">{profile.name?.[0] || profile.username?.[0] || '?'}</Text>
            </View>
          )}
          <Text className="text-center text-blue-400 mt-2">Change Avatar</Text>
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
            <View className="bg-destructive/20 p-3 rounded-xl mb-4">
              <Text className="text-destructive-foreground text-center">{error}</Text>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className={`w-full py-3 rounded-xl mt-6 ${loading ? 'bg-gray-400' : 'bg-primary'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-black text-center font-semibold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
