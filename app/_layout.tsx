// app/_layout.tsx
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { Slot } from 'expo-router';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Spotlight } from '@/src/shared/components/Spotlight';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-black">
            <Spotlight intensity={0.2}>
              <Slot />
            </Spotlight>
          </SafeAreaView>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}
