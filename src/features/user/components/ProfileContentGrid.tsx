import { Play } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';

interface Post {
  id: string;
  imageUrl: string;
  type?: 'photo' | 'video';
}

interface ProfileContentGridProps {
  posts: Post[];
  columns?: number;
  onPostPress: (postId: string) => void;
}

export function ProfileContentGrid({ columns = 3, onPostPress, posts }: ProfileContentGridProps) {
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
          style={{ height: itemSize, width: itemSize }}
        >
          <TouchableOpacity
            onPress={() => onPostPress(post.id)}
            activeOpacity={0.9}
            style={{ backgroundColor: '#ffffff10', height: itemSize, width: itemSize }}
          >
            <Image source={{ uri: post.imageUrl }} style={{ height: itemSize, width: itemSize }} resizeMode="cover" />
            {post.type === 'video' && (
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  bottom: 0,
                  justifyContent: 'center',
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  top: 0,
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
