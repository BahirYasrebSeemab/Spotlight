// components/profile/EmptyProfileContent.tsx
import { View, Text } from 'react-native';
import { PackageOpen } from 'lucide-react-native';

interface EmptyProfileContentProps {
  isOwnProfile: boolean;
  activeTab: string;
}

export function EmptyProfileContent({ isOwnProfile, activeTab }: EmptyProfileContentProps) {
  const messages: Record<string, string> = {
    all: isOwnProfile ? 'Start sharing your moments' : 'Nothing here yet',
    photos: 'No photos to show',
    videos: 'No videos to show',
    saved: 'Nothing saved yet',
    tagged: 'No tagged posts',
  };

  return (
    <View className="flex-1 items-center justify-center py-32 px-8">
      <View className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-900 items-center justify-center mb-6">
        <PackageOpen size={40} color="#9CA3AF" strokeWidth={1.5} />
      </View>
      <Text className="text-2xl font-bold text-black dark:text-white mb-2">{messages[activeTab]}</Text>
      {isOwnProfile && activeTab === 'all' && (
        <Text className="text-base text-gray-500 dark:text-gray-400 text-center leading-6">
          Share photos and videos{'\n'}to fill your profile
        </Text>
      )}
    </View>
  );
}
