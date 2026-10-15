import { ReactNode, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { EASE_OUT, REDUCED_REVEAL_DURATION_MS, REVEAL_DURATION_MS } from '../constants/motion';

/**
 * rise  — text and rows drifting up into place
 * land  — tiles dropping into a grid
 * stamp — a badge or chip pressed down onto a surface (springs past 1 for a small squish)
 */
export type RevealVariant = 'rise' | 'land' | 'stamp';

const START: Record<RevealVariant, { scale: number; translateY: number }> = {
  land: { scale: 0.94, translateY: -14 },
  rise: { scale: 1, translateY: 10 },
  stamp: { scale: 1.35, translateY: 0 },
};

interface RevealProps {
  delay?: number;
  /** Plays once, the first time this becomes true. */
  active: boolean;
  children: ReactNode;
  variant?: RevealVariant;
  style?: StyleProp<ViewStyle>;
}

export function Reveal({ active, children, delay = 0, variant = 'rise', style }: RevealProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active || progress.get() > 0) return;
    const animation =
      variant === 'stamp' && !reducedMotion
        ? withSpring(1, { dampingRatio: 0.55, duration: 450 })
        : withTiming(1, {
            duration: reducedMotion ? REDUCED_REVEAL_DURATION_MS : REVEAL_DURATION_MS,
            easing: EASE_OUT,
          });
    progress.set(withDelay(reducedMotion ? 0 : delay, animation));
  }, [active, delay, progress, reducedMotion, variant]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.get();
    const opacity = interpolate(p, [0, 0.6], [0, 1], Extrapolation.CLAMP);
    if (reducedMotion) return { opacity };

    const start = START[variant];
    return {
      opacity,
      transform: [{ translateY: start.translateY * (1 - p) }, { scale: start.scale + (1 - start.scale) * p }],
    };
  });

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
