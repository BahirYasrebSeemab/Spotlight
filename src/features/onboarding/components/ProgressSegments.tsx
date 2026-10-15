import { View } from 'react-native';
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated';

interface ProgressSegmentsProps {
  count: number;
  pageWidth: number;
  scrollX: SharedValue<number>;
}

/** Story-style progress bar: each segment fills as its page scrolls into view. */
export function ProgressSegments({ count, pageWidth, scrollX }: ProgressSegmentsProps) {
  return (
    <View className="flex-1 flex-row gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <Segment key={i} index={i} pageWidth={pageWidth} scrollX={scrollX} />
      ))}
    </View>
  );
}

interface SegmentProps {
  index: number;
  pageWidth: number;
  scrollX: SharedValue<number>;
}

function Segment({ index, pageWidth, scrollX }: SegmentProps) {
  // Absolutely positioned and childless, so animating width doesn't re-layout siblings.
  const fillStyle = useAnimatedStyle(() => {
    const page = pageWidth > 0 ? scrollX.get() / pageWidth : 0;
    const fill = interpolate(page, [index - 1, index], [0, 1], Extrapolation.CLAMP);
    return { width: `${fill * 100}%` };
  });

  return (
    <View className="flex-1 h-[3px] rounded-full bg-white/15 overflow-hidden">
      <Animated.View
        style={[{ backgroundColor: '#ffffff', bottom: 0, left: 0, position: 'absolute', top: 0 }, fillStyle]}
      />
    </View>
  );
}
