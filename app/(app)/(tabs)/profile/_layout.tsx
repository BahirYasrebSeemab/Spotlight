// ========================================
// app/(tabs)/profile/_layout.tsx - FIXED
// ========================================
import { Stack, useRouter } from 'expo-router';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '@/src/features/user/hooks/useUserProfile';
import { Pressable, ActivityIndicator, View } from 'react-native';
import { Settings } from 'lucide-react-native';

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
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: profile.username,
          headerStyle: { backgroundColor: 'transparent' },
          headerRight: () => (
            <Pressable onPress={() => router.push('/(tabs)/profile/settings')} className="p-2">
              <Settings size={22} color={'white'} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: 'transparent' },
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
        name="danger"
        options={{
          title: 'Account Management',
          headerStyle: { backgroundColor: 'transparent' },
          headerShown: false
        }}
      />
    </Stack>
  );
}
