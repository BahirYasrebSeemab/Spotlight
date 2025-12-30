import { View, FlatList, ActivityIndicator } from 'react-native';
import { useAppSelector } from '@/src/shared/hooks/redux';
import IdentitySection from '../components/IdentitySection';
import { PrimaryButton } from '@/src/shared/components/PrimaryButton';
import { useLogout } from '../../auth/hooks';
import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Pressable } from 'react-native';
import { MoreVertical } from 'lucide-react-native';

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

  console.log('ProfileScreen user:', user);

    const navigation = useNavigation();

   const router = useRouter();

   useLayoutEffect(() => {
     navigation.setOptions({
       headerRight: () => (
         <Pressable onPress={() => router.push('/(tabs)/profile/settings')} className="p-2">
           <MoreVertical size={22} color={'white'} />
         </Pressable>
       ),
     });
   }, [router]);


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
        ListFooterComponent={<IdentitySection user={user} loading={loading} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}
