import { ImageSourcePropType } from 'react-native';

// Royalty-free product photography (Unsplash License), bundled so onboarding
// renders instantly and offline.
export const ONBOARDING_IMAGES = {
  af1Carhartt: require('@/assets/images/onboarding/af1-carhartt.jpg'),
  af1Shadow: require('@/assets/images/onboarding/af1-shadow.jpg'),
  airMax1: require('@/assets/images/onboarding/air-max-1.jpg'),
  bikerJacket: require('@/assets/images/onboarding/biker-jacket.jpg'),
  freeRn: require('@/assets/images/onboarding/free-rn.jpg'),
  kiikiiTee: require('@/assets/images/onboarding/kiikii-tee.jpg'),
  levis501: require('@/assets/images/onboarding/levis-501.jpg'),
  memory: require('@/assets/images/onboarding/memory.jpg'),
  wayfarer: require('@/assets/images/onboarding/wayfarer.jpg'),
} satisfies Record<string, ImageSourcePropType>;

export const CLOSET_TILES: ImageSourcePropType[] = [
  ONBOARDING_IMAGES.af1Carhartt,
  ONBOARDING_IMAGES.levis501,
  ONBOARDING_IMAGES.wayfarer,
  ONBOARDING_IMAGES.bikerJacket,
  ONBOARDING_IMAGES.af1Shadow,
  ONBOARDING_IMAGES.kiikiiTee,
  ONBOARDING_IMAGES.freeRn,
  ONBOARDING_IMAGES.airMax1,
];
