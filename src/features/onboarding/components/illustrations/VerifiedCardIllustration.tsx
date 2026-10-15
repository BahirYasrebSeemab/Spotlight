import { BadgeCheckIcon } from 'lucide-react-native';
import { Image, Platform, Text, View } from 'react-native';

import { VerifiedBadge } from '@/src/shared/ui';

import { Reveal } from '../Reveal';
import { ONBOARDING_IMAGES } from '../../constants/images';

interface VerifiedCardIllustrationProps {
  width: number;
  active: boolean;
}

const MONO = Platform.select({ android: 'monospace', default: 'Menlo' });

/** An item card that gets stamped verified, then shows the serial that travels with it. */
export function VerifiedCardIllustration({ active, width }: VerifiedCardIllustrationProps) {
  const imageHeight = width * 0.78;

  return (
    <Reveal active={active}>
      <View style={{ width }} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <View>
          <Image source={ONBOARDING_IMAGES.af1Carhartt} style={{ height: imageHeight, width }} />
          <Reveal active={active} delay={520} variant="stamp" style={{ position: 'absolute', right: 14, top: 14 }}>
            <View className="w-12 h-12 rounded-full bg-black/80 border border-white/20 items-center justify-center">
              <BadgeCheckIcon size={28} color="black" fill="white" />
            </View>
          </Reveal>
        </View>

        <View className="p-4">
          <Text className="text-foreground text-base font-semibold" numberOfLines={1}>
            Air Force 1 &apos;07 × Carhartt WIP
          </Text>
          <View className="flex-row items-center gap-1.5 mt-1">
            <Text className="text-muted-foreground text-sm">Nike</Text>
            <Reveal active={active} delay={640} variant="stamp">
              <VerifiedBadge size={14} />
            </Reveal>
          </View>

          <Reveal active={active} delay={820}>
            <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-white/10">
              <Text className="text-muted-foreground text-[11px] font-semibold tracking-widest">SERIAL</Text>
              <Text className="text-foreground text-sm" style={{ fontFamily: MONO, letterSpacing: 1 }}>
                NK-AF1-0427-CWIP
              </Text>
            </View>
          </Reveal>
        </View>
      </View>
    </Reveal>
  );
}
