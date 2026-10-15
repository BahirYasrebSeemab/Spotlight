import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LayoutChangeEvent, Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

import { Button } from '@/src/shared/ui';
import { useAppSelector } from '@/src/shared/hooks/redux';
import { useUserProfile } from '@/src/shared/hooks/useUserProfile';

import { Reveal } from '../components/Reveal';
import { ProgressSegments } from '../components/ProgressSegments';
import { ONBOARDING_SLIDES, OnboardingSlide } from '../constants/slides';
import { ProfileIllustration } from '../components/illustrations/ProfileIllustration';
import { MemoryTagIllustration } from '../components/illustrations/MemoryTagIllustration';
import { ClosetGridIllustration } from '../components/illustrations/ClosetGridIllustration';
import { VerifiedCardIllustration } from '../components/illustrations/VerifiedCardIllustration';

const SIDE_PADDING = 24;
const STAGE_PADDING = 24;
const MAX_ILLUSTRATION_WIDTH = 340;
// Tallest illustration is ~1.22× its width; used to shrink them on short screens.
const ILLUSTRATION_ASPECT = 1.22;

export function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: pageWidth } = useWindowDimensions();
  const user = useAppSelector(state => state.auth.user);
  const { data: profile } = useUserProfile(user?.id);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);
  const [index, setIndex] = useState(0);
  const [furthestSeen, setFurthestSeen] = useState(0);
  const [pageHeight, setPageHeight] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);

  const isLast = index === ONBOARDING_SLIDES.length - 1;
  const illustrationWidth = Math.min(
    pageWidth - SIDE_PADDING * 2,
    MAX_ILLUSTRATION_WIDTH,
    stageHeight > 0 ? stageHeight / ILLUSTRATION_ASPECT : MAX_ILLUSTRATION_WIDTH,
  );

  const onPageChange = useCallback((page: number) => {
    setIndex(page);
    setFurthestSeen(prev => Math.max(prev, page));
  }, []);

  const onScroll = useAnimatedScrollHandler(event => {
    scrollX.set(event.contentOffset.x);
  });

  // Hand the page index to React only when it crosses the halfway point, not per frame.
  useAnimatedReaction(
    () => (pageWidth > 0 ? Math.round(scrollX.get() / pageWidth) : 0),
    (page, previous) => {
      if (page !== previous) runOnJS(onPageChange)(page);
    },
    [pageWidth],
  );

  const markComplete = async () => {
    if (user?.id) {
      await AsyncStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    }
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (isLast) {
      markComplete();
      return;
    }
    scrollRef.current?.scrollTo({ animated: true, x: (index + 1) * pageWidth });
  };

  const onPagerLayout = (event: LayoutChangeEvent) => {
    setPageHeight(event.nativeEvent.layout.height);
  };

  const onStageLayout = (event: LayoutChangeEvent) => {
    setStageHeight(event.nativeEvent.layout.height - STAGE_PADDING * 2);
  };

  const renderIllustration = (slide: OnboardingSlide, active: boolean) => {
    const props = { active, width: illustrationWidth };
    switch (slide.key) {
      case 'closet':
        return <ClosetGridIllustration {...props} />;
      case 'verified':
        return <VerifiedCardIllustration {...props} />;
      case 'memory':
        return <MemoryTagIllustration {...props} />;
      case 'profile':
        return (
          <ProfileIllustration
            {...props}
            name={profile?.name}
            username={profile?.username}
            avatarUrl={profile?.avatarUrl}
          />
        );
    }
  };

  return (
    <View className="flex-1" style={{ paddingBottom: insets.bottom + 16, paddingTop: insets.top + 12 }}>
      <View className="flex-row items-center gap-4" style={{ paddingHorizontal: SIDE_PADDING }}>
        <ProgressSegments count={ONBOARDING_SLIDES.length} pageWidth={pageWidth} scrollX={scrollX} />
        <Pressable onPress={markComplete} hitSlop={12} disabled={isLast} style={{ opacity: isLast ? 0 : 1 }}>
          <Text className="text-muted-foreground text-sm font-semibold">Skip</Text>
        </Pressable>
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        onLayout={onPagerLayout}
        style={{ flex: 1 }}
      >
        {ONBOARDING_SLIDES.map((slide, i) => {
          const active = i <= furthestSeen;
          return (
            <View key={slide.key} style={{ height: pageHeight, paddingHorizontal: SIDE_PADDING, width: pageWidth }}>
              <View
                className="flex-1 items-center justify-center"
                style={{ paddingVertical: STAGE_PADDING }}
                onLayout={i === 0 ? onStageLayout : undefined}
              >
                {renderIllustration(slide, active)}
              </View>

              <Reveal active={active} delay={80}>
                <Text className="text-foreground text-4xl font-extrabold tracking-tight">{slide.title}</Text>
              </Reveal>
              <Reveal active={active} delay={160}>
                <Text className="text-muted-foreground text-base leading-6 mt-3 mb-8">{slide.body}</Text>
              </Reveal>
            </View>
          );
        })}
      </Animated.ScrollView>

      <View style={{ paddingHorizontal: SIDE_PADDING }}>
        <Button title={isLast ? 'Get started' : 'Next'} onPress={handleNext} />
      </View>
    </View>
  );
}
