import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useLogout } from '../../auth/hooks';
import { useRouter } from 'expo-router';
import BlurConfirmModal from '@/src/shared/components/Modal'; // <- import your modal

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
  const router = useRouter();

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const handleDeleteConfirm = () => {
    console.log('💀 User confirmed account deletion');
    setDeleteModalVisible(false);

    // call your hook / service to delete the account here
    // e.g. deleteAccount().then(() => router.replace('/(auth)'))
  };

  return (
    <View className="flex-1 bg-white dark:bg-black p-6">
      <Text className="text-xl font-bold text-black dark:text-white mb-4">Account</Text>

      <Row label="Edit Profile" onPress={() => router.navigate('(tabs)/profile/edit-profile')} />
      <Row label="Change Password" onPress={() => router.navigate('(tabs)/profile/change-password')} />

      {/* Delete Account row triggers modal */}
      <Row label="Delete Account" danger onPress={() => setDeleteModalVisible(true)} />

      <Row label="Logout" danger onPress={handleLogout} />

      {/* BlurConfirmModal */}
      <BlurConfirmModal
        visible={deleteModalVisible}
        title="Are you sure?"
        message="This action is irreversible. Type your username to confirm deletion."
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
}
