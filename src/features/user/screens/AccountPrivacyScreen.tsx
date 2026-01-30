import { View, Text, Switch, ActivityIndicator } from 'react-native';
import { useUpdateUser } from '@/src/shared/hooks/useUpdateUser';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';
import { BWToggle } from '@/src/shared/components/BWToggle';

export default function AccountPrivacyScreen() {
  const userId = useAppSelector(state => state.auth.user?.id);

  const { data: profile, isLoading } = useUserProfile(userId || '');
  const { updateProfile, isUpdating } = useUpdateUser();

  if (!profile || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator />
      </View>
    );
  }

  const isPrivate = profile.isPrivate;

  const togglePrivacy = async () => {
    if (!userId) return;
    await updateProfile({
      userId,
      payload: { isPrivate: !isPrivate },
    });
  };

  return (
    <View className="flex-1 bg-white dark:bg-black px-6 py-8">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-lg font-semibold text-black dark:text-white">Private Account</Text>

        <BWToggle value={isPrivate} onToggle={togglePrivacy} disabled={isUpdating} />
      </View>

      <Text className="text-sm text-gray-600 dark:text-gray-400">
        {isPrivate ? 'Only approved followers can see your memories.' : 'Anyone can see your memories.'}
      </Text>
    </View>
  );
}
