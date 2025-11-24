import { View, FlatList, ActivityIndicator } from 'react-native';
import { useAppSelector } from '@/src/shared/hooks/redux';
import IdentitySection from '../components/IdentitySection';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { useLogout } from '../../auth/hooks';

export default function ProfileScreen() {
  const { user, loading } = useAppSelector(state => state.user);
  const { loading: authLoading, user: authUser } = useAppSelector(state => state.auth);
  const { handleLogout } = useLogout();

  if (loading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If email is not confirmed
  // if (!authUser.emailConfirmedAt) {
  //   return (
  //     <View className="flex-1 justify-center items-center bg-white dark:bg-black">
  //       <EmailVerificationNotice email={user.email} />
  //       <PrimaryButton
  //         onPress={handleLogout}
  //         title={authLoading ? 'Logging out...' : 'Logout'}
  //         px="px-4"
  //         disabled={authLoading}
  //       />
  //     </View>
  //   );
  // }

  return (
    <View className="flex-1 justify-center items-center w-full bg-white dark:bg-black">
      <View className="flex-1 justify-center items-center bg-gray-100 dark:bg-black">
        <PrimaryButton
          onPress={handleLogout}
          title={authLoading ? 'Logging out...' : 'Logout'}
          px="px-4"
          disabled={authLoading}
        />
      </View>

      <FlatList
        inverted
        data={[]}
        renderItem={() => null}
        ListFooterComponent={<IdentitySection profile={user} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
