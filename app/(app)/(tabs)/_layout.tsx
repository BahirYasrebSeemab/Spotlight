// app/(tabs)/_layout.tsx - Updated with closet icon
import { Tabs } from 'expo-router';
import { Svg, Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, PlusSquare, Heart, User } from 'lucide-react-native';

import { EmailVerifiedGuard } from '@/src/shared/components/EmailVerifiedGaurd';

// Custom Closet Icon Component
function ClosetIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3h18v18H3V3z" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M12 3v18M12 8h3M12 12h3M12 16h3M9 8H6M9 12H6M9 16H6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 10a2 2 0 1 1 0 .01M14 10a2 2 0 1 1 0 .01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
      />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <EmailVerifiedGuard>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#FFFFFF', // White for active
            tabBarInactiveTintColor: '#666666', // Gray for inactive
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            tabBarStyle: {
              backgroundColor: '#000',
              borderTopColor: '#333333',
              height: 60,
              paddingBottom: 4,
              paddingTop: 4,
            },
          }}
        >
          <Tabs.Screen
            name="closet"
            options={{
              tabBarIcon: ({ color, size }) => <ClosetIcon color={color} size={size} />,
              title: 'Closet',
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
              title: 'Add',
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              headerShown: false,
              tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
              title: 'Activity',
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
      </EmailVerifiedGuard>
    </SafeAreaView>
  );
}
