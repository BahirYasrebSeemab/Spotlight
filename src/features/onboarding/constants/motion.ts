import { Easing } from 'react-native-reanimated';

// Strong ease-out for UI entrances (starts fast, settles gently).
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

export const REVEAL_DURATION_MS = 420;
export const REDUCED_REVEAL_DURATION_MS = 200;

// Delay between items in a staggered entrance (grid tiles, chips).
export const STAGGER_MS = 70;
