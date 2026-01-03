// app/_layout.tsx
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { Slot } from 'expo-router';
import '../global.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </Provider>
  );
}
