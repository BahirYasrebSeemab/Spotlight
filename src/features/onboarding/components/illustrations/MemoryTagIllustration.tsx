import { Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Reveal } from '../Reveal';
import { ONBOARDING_IMAGES } from '../../constants/images';

interface MemoryTagIllustrationProps {
  width: number;
  active: boolean;
}

interface Tag {
  label: string;
  top: `${number}%`;
  left: `${number}%`;
}

// Positioned over the jacket and the glasses in the bundled photo.
const TAGS: Tag[] = [
  { label: 'New Wayfarer', left: '46%', top: '9%' },
  { label: 'Leather Biker Jacket', left: '6%', top: '66%' },
];

/** A memory photo with the pieces worn in it tagged straight from the closet. */
export function MemoryTagIllustration({ active, width }: MemoryTagIllustrationProps) {
  return (
    <Reveal active={active}>
      <View style={{ height: width * 1.2, width }} className="rounded-2xl border border-white/10 overflow-hidden">
        <Image source={ONBOARDING_IMAGES.memory} style={{ height: '100%', width: '100%' }} resizeMode="cover" />

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}
          style={{ bottom: 0, height: '40%', left: 0, position: 'absolute', right: 0 }}
          pointerEvents="none"
        />

        {TAGS.map((tag, i) => (
          <Reveal
            key={tag.label}
            active={active}
            delay={480 + i * 220}
            variant="stamp"
            style={{ left: tag.left, position: 'absolute', top: tag.top }}
          >
            <View className="flex-row items-center gap-1.5 bg-black/75 border border-white/20 rounded-full pl-2 pr-3 py-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
              <Text className="text-foreground text-xs font-semibold">{tag.label}</Text>
            </View>
          </Reveal>
        ))}

        <View className="absolute left-4 right-4 bottom-4">
          <Text className="text-foreground text-lg font-bold">Red on black</Text>
          <Text className="text-white/70 text-xs mt-0.5">Brooklyn, NY · 2 items tagged</Text>
        </View>
      </View>
    </Reveal>
  );
}
