export type OnboardingIllustration = 'closet' | 'verified' | 'memory' | 'profile';

export interface OnboardingSlide {
  body: string;
  title: string;
  key: OnboardingIllustration;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    body: "Sneakers, denim, the jacket you'll never sell. Catalogue all of it in one place.",
    key: 'closet',
    title: 'Everything you own.',
  },
  {
    body: 'Pieces from partner brands arrive verified, with a serial that follows the item wherever it goes.',
    key: 'verified',
    title: 'Proven yours.',
  },
  {
    body: 'Post a memory and tag what you had on. Every photo links back to the pieces in your closet.',
    key: 'memory',
    title: 'Wear it. Tag it.',
  },
  {
    body: 'Your closet, your memories, and the people who follow them. All under your name.',
    key: 'profile',
    title: 'Make it yours.',
  },
];
