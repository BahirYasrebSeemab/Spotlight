import { Camera } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';

interface ProfileTabBarProps {
  isOwnProfile: boolean;
  activeTab: 'memories' | 'matches';
  onTabChange: (tab: 'memories' | 'matches') => void;
}

export function ProfileTabBar({ activeTab, onTabChange }: ProfileTabBarProps) {
  const tabs = [
    { icon: Camera, id: 'memories' as const, label: 'Memories' },
    // { id: 'matches' as const, label: 'Matches', icon: Layers },
  ];

  return (
    <View className="flex-row border-b border-white/10 bg-black">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            className="flex-1 py-3 items-center border-b-2"
            style={{
              borderBottomColor: isActive ? '#ffffff' : 'transparent',
            }}
          >
            <View className="flex-row items-center gap-2">
              <Icon size={18} color={isActive ? '#ffffff' : '#6B7280'} strokeWidth={2} />
              <Text className={`font-semibold ${isActive ? 'text-white' : 'text-gray-400'}`}>{tab.label}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
