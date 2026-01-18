// components/profile/ProfileTabBar.tsx - Top Tab Bar (Fixed Height)
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
    <View className="bg-black border-b border-gray-800 shadow-sm">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 12 }}
        style={{ height: 56 }}
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              className={`flex-row items-center px-4 py-2 rounded-full mr-2 ${
                isActive ? 'bg-white' : 'bg-gray-800'
              }`}
              style={{ height: 36 }}
            >
              <Icon size={18} color={isActive ? 'black' : '#999999'} />
              <Text className={`ml-2 font-medium ${isActive ? 'text-black' : 'text-gray-400'}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
