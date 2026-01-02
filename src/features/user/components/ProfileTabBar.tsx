// components/profile/ProfileTabBar.tsx - Top Tab Bar
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Grid2x2, Bookmark, Tag, Video, Image as ImageIcon } from 'lucide-react-native';

interface ProfileTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOwnProfile: boolean;
}

export function ProfileTabBar({ activeTab, onTabChange, isOwnProfile }: ProfileTabBarProps) {
  const tabs = [
    { id: 'all', icon: Grid2x2, label: 'All' },
    { id: 'photos', icon: ImageIcon, label: 'Photos' },
    { id: 'videos', icon: Video, label: 'Videos' },
    ...(isOwnProfile ? [{ id: 'saved', icon: Bookmark, label: 'Saved' }] : []),
    { id: 'tagged', icon: Tag, label: 'Tagged' },
  ];

  return (
    <View className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-2 py-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                isActive ? 'bg-purple-600' : 'bg-gray-100 dark:bg-gray-900'
              }`}
            >
              <Icon size={18} color={isActive ? 'white' : '#9CA3AF'} />
              <Text className={`ml-2 font-medium ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
