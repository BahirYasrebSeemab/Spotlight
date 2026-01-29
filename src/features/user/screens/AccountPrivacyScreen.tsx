import { View, Text, ToggleLeft } from 'lucide-react-native';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useUserProfile } from '../hooks/useUserProfile';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function AccountPrivacyScreen() {
  const { submit } = useUpdateUser();
  const userId = useAppSelector(state => state.auth.user?.id);

  const handleTogglePrivacy = async () => {
    if (!userId) return;
    await submit({ userId, payload: { isPrivate: true } });
  }

  return (
    <View className="flex-1 bg-white dark:bg-black p-6">
      <ToggleLeft onPress={handleTogglePrivacy} size={24} color="black" />
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Account Privacy Settings</Text>
      {/* Add your privacy settings options here */}
    </View>
  );
};
