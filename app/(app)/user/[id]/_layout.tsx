// app/user/[id]/_layout.tsx - Individual user layout
import { Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function UserProfileLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: '', // Username will be set in the screen
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="avatar"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Profile Picture',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="followers"
        options={{
          headerShown: true,
          title: 'Spotters',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="following"
        options={{
          headerShown: true,
          title: 'Spotted',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}
