// app/_layout.tsx
import { Provider } from 'react-redux';
import { store } from '@/src/store';
import { Slot } from 'expo-router';
import "../global.css";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Slot />
    </Provider>
  );
}
