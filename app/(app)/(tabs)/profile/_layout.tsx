// ========================================
// app/(tabs)/profile/_layout.tsx - FIXED
// ========================================
import { Stack, useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Pressable, ActivityIndicator, View } from 'react-native';

import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';

export default function ProfileLayout() {
  // Get auth user ID from Redux
  const authUser = useAppSelector(state => state.auth.user);
  const router = useRouter();

  // Fetch full profile data with React Query
  const { data: profile, isLoading } = useUserProfile(authUser?.id);

  // Show loading state
  if (isLoading || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push('/(tabs)/profile/settings')} className="p-2">
              <Settings size={22} color={'white'} />
            </Pressable>
          ),
          headerShown: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTitle: profile.username,
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: 'transparent' },
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="change-password"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account-privacy"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="danger"
        options={{
          headerShown: false,
          headerStyle: { backgroundColor: 'transparent' },
          title: 'Account Management',
        }}
      />
    </Stack>
  );
}
