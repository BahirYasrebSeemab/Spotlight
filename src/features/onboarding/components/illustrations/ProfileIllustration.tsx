import { Image, Text, View } from 'react-native';

import { Avatar } from '@/src/shared/ui';
import { AvatarSpotlight } from '@/src/shared/components/AvatarSpotlight';

import { Reveal } from '../Reveal';
import { STAGGER_MS } from '../../constants/motion';
import { ONBOARDING_IMAGES } from '../../constants/images';

interface ProfileIllustrationProps {
  width: number;
  active: boolean;
  name?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
}

const AVATAR_SIZE = 96;
const GAP = 8;
const PREVIEW_TILES = [ONBOARDING_IMAGES.memory, ONBOARDING_IMAGES.af1Shadow, ONBOARDING_IMAGES.wayfarer];

/** The signed-in user's own profile header, lit by the spotlight. */
export function ProfileIllustration({ active, width, name, username, avatarUrl }: ProfileIllustrationProps) {
  const tile = (width - GAP * (PREVIEW_TILES.length - 1)) / PREVIEW_TILES.length;
  const handle = username ? `@${username}` : 'your profile';

  return (
    <View style={{ width }} className="items-center">
      <Reveal active={active} variant="stamp">
        <AvatarSpotlight size={AVATAR_SIZE} intensity={0.45}>
          <Avatar uri={avatarUrl} label={name || username || '?'} size={AVATAR_SIZE} />
        </AvatarSpotlight>
      </Reveal>

      <Reveal active={active} delay={180}>
        <View className="items-center mt-5">
          {name ? <Text className="text-foreground text-2xl font-bold">{name}</Text> : null}
          <Text className="text-muted-foreground text-sm mt-1">{handle}</Text>
        </View>
      </Reveal>

      <View className="flex-row mt-8" style={{ gap: GAP }}>
        {PREVIEW_TILES.map((source, i) => (
          <Reveal key={i} active={active} delay={360 + i * STAGGER_MS} variant="land">
            <Image
              source={source}
              style={{ height: tile * 1.25, width: tile }}
              className="rounded-xl border border-white/10 bg-muted"
            />
          </Reveal>
        ))}
      </View>
    </View>
  );
}
