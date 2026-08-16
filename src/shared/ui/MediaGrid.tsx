import { ReactNode } from 'react';
import { Play, Package } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { View, Image, Pressable, Dimensions } from 'react-native';

import { cn } from './cn';

export interface MediaGridItem {
  id: string;
  isVideo?: boolean;
  imageUri?: string | null;
}

export interface MediaGridProps<T extends MediaGridItem> {
  data: T[];
  gap?: number;
  columns?: number;
  className?: string;
  fallbackIcon?: ReactNode;
  onItemPress: (item: T) => void;
}

export function MediaGrid<T extends MediaGridItem>({
  data,
  onItemPress,
  columns = 3,
  gap = 2,
  fallbackIcon,
  className,
}: MediaGridProps<T>) {
  const screenWidth = Dimensions.get('window').width;
  const itemSize = (screenWidth - gap * (columns - 1)) / columns;

  return (
    <View className={cn('flex-row flex-wrap', className)} style={{ gap }}>
      {data.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeIn.delay(Math.min(index, 12) * 30).duration(300)}
          style={{ height: itemSize, width: itemSize }}
        >
          <Pressable
            onPress={() => onItemPress(item)}
            className="bg-muted items-center justify-center"
            style={{ height: itemSize, width: itemSize }}
          >
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={{ height: itemSize, width: itemSize }} resizeMode="cover" />
            ) : (
              (fallbackIcon ?? <Package size={28} color="#3a3a3a" strokeWidth={1.5} />)
            )}

            {item.isVideo && (
              <View className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1">
                <Play size={12} color="white" fill="white" />
              </View>
            )}
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}
