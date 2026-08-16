// app/user/[id]/_layout.tsx - Individual user layout
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

export default function UserProfileLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShadowVisible: false,
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          title: '', // Username will be set in the screen
        }}
      />
      <Stack.Screen
        name="avatar"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          presentation: 'modal',
          title: 'Profile Picture',
        }}
      />
      <Stack.Screen
        name="followers"
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingRight: 24 }}>
              <ArrowLeft size={22} color="white" />
            </Pressable>
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          title: 'Spotters',
        }}
      />
      <Stack.Screen
        name="following"
        options={{
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ paddingRight: 24 }}>
              <ArrowLeft size={22} color="white" />
            </Pressable>
          ),
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          title: 'Spotted',
        }}
      />
    </Stack>
  );
}
