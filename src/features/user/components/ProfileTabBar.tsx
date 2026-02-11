import { View, Text, Pressable } from 'react-native';
import { Camera, Layers } from 'lucide-react-native';

interface ProfileTabBarProps {
  activeTab: 'memories' | 'matches';
  onTabChange: (tab: 'memories' | 'matches') => void;
  isOwnProfile: boolean;
}

export function ProfileTabBar({ activeTab, onTabChange, isOwnProfile }: ProfileTabBarProps) {
  const tabs = [
    { id: 'memories' as const, label: 'Memories', icon: Camera },
    { id: 'matches' as const, label: 'Matches', icon: Layers },
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
