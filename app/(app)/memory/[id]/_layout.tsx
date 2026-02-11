import { Stack } from 'expo-router';

export default function MemoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
      }}
    />
  );
}
