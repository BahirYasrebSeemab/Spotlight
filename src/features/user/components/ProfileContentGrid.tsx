// components/profile/ProfileContentGrid.tsx - Masonry/Grid Content
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play, Volume2 } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Post {
  id: string;
  imageUrl: string;
  type?: 'photo' | 'video';
  aspectRatio?: number;
}

interface ProfileContentGridProps {
  posts: Post[];
  onPostPress: (postId: string) => void;
  columns?: number;
}

export function ProfileContentGrid({ posts, onPostPress, columns = 3 }: ProfileContentGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const gap = 2;
  const itemSize = (screenWidth - gap * (columns + 1)) / columns;

  return (
    <View className="flex-row flex-wrap bg-white dark:bg-black" style={{ gap }}>
      {posts.map((post, index) => (
        <Animated.View key={post.id} entering={FadeIn.delay(index * 50).duration(400)}>
          <TouchableOpacity
            onPress={() => onPostPress(post.id)}
            className="bg-gray-200 dark:bg-gray-800 overflow-hidden"
            style={{
              width: itemSize,
              height: itemSize,
            }}
            activeOpacity={0.9}
          >
            <Image source={{ uri: post.imageUrl }} className="w-full h-full" resizeMode="cover" />
            {post.type === 'video' && (
              <View className="absolute inset-0 items-center justify-center bg-black/20">
                <View className="bg-white/90 rounded-full p-2">
                  <Play size={20} color="black" fill="black" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}
