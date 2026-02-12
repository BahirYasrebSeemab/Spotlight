import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Play } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface Post {
  id: string;
  imageUrl: string;
  type?: 'photo' | 'video';
}

interface ProfileContentGridProps {
  posts: Post[];
  onPostPress: (postId: string) => void;
  columns?: number;
}

export function ProfileContentGrid({ posts, onPostPress, columns = 3 }: ProfileContentGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const gap = 2;
  const itemSize = (screenWidth - gap * (columns - 1)) / columns;

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap,
      }}
    >
      {posts.map((post, index) => (
        <Animated.View
          key={post.id}
          entering={FadeIn.delay(index * 30).duration(300)}
          style={{ width: itemSize, height: itemSize }}
        >
          <TouchableOpacity
            onPress={() => onPostPress(post.id)}
            activeOpacity={0.9}
            style={{ width: itemSize, height: itemSize, backgroundColor: '#ffffff10' }}
          >
            <Image source={{ uri: post.imageUrl }} style={{ width: itemSize, height: itemSize }} resizeMode="cover" />
            {post.type === 'video' && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                }}
              >
                <View
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 999,
                    padding: 8,
                  }}
                >
                  <Play size={18} color="black" fill="black" />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      ))}
    </View>
  );
}
