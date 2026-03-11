// app/(tabs)/_layout.tsx - Updated with closet icon
import { Spotlight } from '@/src/shared/components/Spotlight';
import { Tabs } from 'expo-router';
import { Search, PlusSquare, Heart, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
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
            name="closet"
            options={{
              title: 'Closet',
              tabBarIcon: ({ color, size }) => <ClosetIcon color={color} size={size} />,
            }}
          />

          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="new"
            options={{
              title: 'Add',
              tabBarIcon: ({ color, size }) => <PlusSquare size={size} color={color} />,
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Activity',
              tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
            }}
          />
        </Tabs>
      </EmailVerifiedGuard>
    </SafeAreaView>
  );
}
