// components/profile/EmptyProfileContent.tsx
import { View, Text } from 'react-native';
import { PackageOpen } from 'lucide-react-native';

interface EmptyProfileContentProps {
  activeTab: string;
  isOwnProfile: boolean;
}

export function EmptyProfileContent({ activeTab, isOwnProfile }: EmptyProfileContentProps) {
  const messages: Record<string, string> = {
    all: isOwnProfile ? 'Start sharing your moments' : 'Nothing here yet',
    photos: 'No photos to show',
    saved: 'Nothing saved yet',
    tagged: 'No tagged posts',
    videos: 'No videos to show',
  };

  return (
    <View className="flex-1 items-center justify-center py-32 px-8">
      <View className="w-24 h-24 rounded-full bg-muted items-center justify-center mb-6">
        <PackageOpen size={40} color="#9CA3AF" strokeWidth={1.5} />
      </View>
      <Text className="text-2xl font-bold text-foreground mb-2">{messages[activeTab]}</Text>
      {isOwnProfile && activeTab === 'all' && (
        <Text className="text-base text-muted-foreground text-center leading-6">
          Share photos and videos{'\n'}to fill your profile
        </Text>
      )}
    </View>
  );
}
