import { Stack } from 'expo-router';
import { useAppSelector } from '@/src/shared/hooks/redux';


export default function ProfileLayout() {
  const { user, loading } = useAppSelector(state => state.user);

  if (loading || !user) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen options={{ headerTitle: user.username, headerStyle: { backgroundColor: 'transparent' } }} name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="danger" />
    </Stack>
  );
}
