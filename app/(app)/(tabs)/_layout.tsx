// app/(tabs)/_layout.tsx - Updated with better icons
import { Tabs } from 'expo-router';
import { Home, Search, PlusSquare, Heart, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B5CF6', // Purple
        tabBarInactiveTintColor: '#9CA3AF', // Gray
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#1F2937',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
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
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
          title: 'Search',
        }}
      />
      <Tabs.Screen
        name="new"
        options={{
          tabBarIcon: ({ color, size }) => <PlusSquare size={size} color={color} />,
          title: 'New',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
