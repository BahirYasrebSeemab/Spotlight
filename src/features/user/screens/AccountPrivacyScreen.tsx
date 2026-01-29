import { View, Text, TouchableOpacity } from 'react-native';
import { ToggleLeft } from 'lucide-react-native';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '../hooks/useUserProfile';

export default function AccountPrivacyScreen() {
  const { submit } = useUpdateUser();
  const userId = useAppSelector(state => state.auth.user?.id);
  const isPrivate = useUserProfile(userId).data?.isPrivate;

  const handleTogglePrivacy = async () => {
    if (!userId) return;
    await submit({ userId, payload: { isPrivate: !isPrivate } });
  }

  return (
    <View className="flex-1 bg-white dark:bg-black p-6">
      <TouchableOpacity onPress={handleTogglePrivacy}>
        {isPrivate ? (
          <ToggleLeft size={24} color="black" />
        ) : (
          <ToggleLeft size={24} color="black" />
        )}
      </TouchableOpacity>
      {isPrivate ? (
        <Text className="text-base text-black dark:text-white mb-4">Your account is currently Private. Only approved followers can see your memories.</Text>
      ) : (
        <Text className="text-base text-black dark:text-white mb-4">Your account is currently Public. Anyone can see your memories.</Text>
      )}
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Account Privacy Settings</Text>
      {/* Add your privacy settings options here */}
    </View>
  );
};
