import { View, Text, TouchableOpacity } from 'react-native';
import { useLogout } from '@/src/features/auth/hooks';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { useAppSelector } from '@/src/shared/hooks/redux';

export default function Profile() {
  const { handleLogout } = useLogout();
  const { loading } = useAppSelector(state => state.auth);

  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black">
      <Text className="text-xl font-bold text-dark dark:text-white">Profile</Text>
      <View className="h-[1px] w-4/5 my-8 bg-[#eee] dark:bg-zinc-900" />
      <View className="mt-2 mx-5 items-center">
        <Text className="text-center text-blue-500 dark:text-white">hello this is profile page</Text>
        <PrimaryButton onPress={handleLogout} title={loading ? "Logging out..." : "Logout"} px="px-4" disabled={loading} />
      </View>
    </View>
  );
}
