// app/(tabs)/_layout.tsx - Updated with better icons
import { Tabs } from 'expo-router';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaView className='flex-1'>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#FFFFFF', // White for active
          tabBarInactiveTintColor: '#666666', // Gray for inactive
          tabBarStyle: {
            backgroundColor: '#000',
            borderTopColor: '#333333',
            height: 60,
            paddingBottom: 4,
            paddingTop: 4,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            tabBarIcon: ({ color, size }) => <PlusSquare size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
