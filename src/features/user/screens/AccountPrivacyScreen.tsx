import { View, Text, ActivityIndicator } from 'react-native';

import { useAppSelector } from '@/src/shared/hooks/redux';
import { BWToggle } from '@/src/shared/components/BWToggle';
import { useUpdateUser } from '@/src/shared/hooks/useUpdateUser';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';

export default function AccountPrivacyScreen() {
  const userId = useAppSelector(state => state.auth.user?.id);

  const { data: profile, isLoading } = useUserProfile(userId || '');
  const { isUpdating, updateProfile } = useUpdateUser();

  if (!profile || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  const isPrivate = profile.isPrivate;

  const togglePrivacy = async () => {
    if (!userId) return;
    await updateProfile({
      payload: { isPrivate: !isPrivate },
      userId,
    });
  };

  return (
    <View className="flex-1 bg-background px-6 py-8">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-lg font-semibold text-foreground">Private Account</Text>

        <BWToggle value={isPrivate} onToggle={togglePrivacy} disabled={isUpdating} />
      </View>

      <Text className="text-sm text-muted-foreground">
        {isPrivate ? 'Only approved followers can see your memories.' : 'Anyone can see your memories.'}
      </Text>
    </View>
  );
}
