import { View, Text, TouchableOpacity } from 'react-native';
import { useLogout } from '../../auth/hooks';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useRouter } from 'expo-router';

function Row({ label, danger, onPress }: { label: string; danger?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-4 bg-gray-100 dark:bg-neutral-900 rounded-xl mb-2"
    >
      <Text className={`text-base ${danger ? 'text-red-500' : 'text-black dark:text-white'}`}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { handleLogout } = useLogout();
  const { user } = useAppSelector(state => state.user);
  const router = useRouter();

  return (
    <View className="flex-1 bg-white dark:bg-black p-6">
      {/* Section Title */}
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Account</Text>

      <Row label="Edit Profile" onPress={() => router.navigate('(tabs)/profile/edit-profile')} />
      <Row label="Change Password" onPress={() => router.navigate('(tabs)/profile/change-password')} />
      <Row label="Delete Account" danger onPress={() => console.log('Delete Account')} />
      <Row label="Logout" danger onPress={handleLogout} />

      {/* Another section if needed later */}
      {/* <Text className="text-xl font-bold text-black dark:text-white mt-8 mb-4">App</Text>
      <Row label="Notifications" onPress={() => {}} /> */}
    </View>
  );
}
