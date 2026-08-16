// app/user/[id]/_layout.tsx - Individual user layout
import { Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

import { useBrandProfile } from '@/src/features/brands/hooks/useBrandProfile';

export default function BrandProfileLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: brand } = useBrandProfile(id); // Fetch brand profile data when the layout is rendered

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
          title: brand?.name, // Brnad name will be set in the screen
        }}
      />
      <Stack.Screen
        name="followers"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          title: 'Followers',
        }}
      />
    </Stack>
  );
}
