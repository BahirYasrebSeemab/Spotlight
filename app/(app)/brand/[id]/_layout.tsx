// app/user/[id]/_layout.tsx - Individual user layout
import { useBrandProfile } from '@/src/features/brands/hooks/useBrandProfile';
import { Stack } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function BrandProfileLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: brand } = useBrandProfile(id); // Fetch brand profile data when the layout is rendered

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: brand?.name, // Brnad name will be set in the screen
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="followers"
        options={{
          headerShown: true,
          title: 'Followers',
          headerStyle: {
            backgroundColor: '#000',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack>
  );
}
