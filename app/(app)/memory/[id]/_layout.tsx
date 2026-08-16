import { Stack } from 'expo-router';

export default function MemoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#ffffff',
      }}
    />
  );
}
