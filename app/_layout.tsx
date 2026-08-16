// app/_layout.tsx
import { useState } from 'react';
import { Slot } from 'expo-router';
import { Provider } from 'react-redux';

import '../global.css';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { store } from '@/src/store';
import { Spotlight } from '@/src/shared/components/Spotlight';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <Spotlight intensity={0.2}>
            <Slot />
          </Spotlight>
        </SafeAreaProvider>
      </QueryClientProvider>
    </Provider>
  );
}
