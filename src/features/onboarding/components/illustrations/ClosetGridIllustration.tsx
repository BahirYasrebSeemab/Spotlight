import { Plus } from 'lucide-react-native';
import { Image, Text, View } from 'react-native';

import { PillBadge } from '@/src/shared/ui';

import { Reveal } from '../Reveal';
import { STAGGER_MS } from '../../constants/motion';
import { CLOSET_TILES } from '../../constants/images';

interface ClosetGridIllustrationProps {
  width: number;
  active: boolean;
}

const COLUMNS = 3;
const GAP = 8;

/** A closet filling up: tiles land in the grid one by one. */
export function ClosetGridIllustration({ active, width }: ClosetGridIllustrationProps) {
  const tile = (width - GAP * (COLUMNS - 1)) / COLUMNS;

  return (
    <View style={{ width }}>
      <Reveal active={active}>
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-foreground text-lg font-bold">My Closet</Text>
          <PillBadge label={`${CLOSET_TILES.length} items`} />
        </View>
      </Reveal>

      <View className="flex-row flex-wrap" style={{ gap: GAP }}>
        {CLOSET_TILES.map((source, i) => (
          <Reveal key={i} active={active} delay={120 + i * STAGGER_MS} variant="land">
            <Image
              source={source}
              style={{ height: tile, width: tile }}
              className="rounded-xl border border-white/10 bg-muted"
            />
          </Reveal>
        ))}
        <Reveal active={active} delay={120 + CLOSET_TILES.length * STAGGER_MS} variant="land">
          <View
            style={{ height: tile, width: tile }}
            className="rounded-xl border border-dashed border-white/25 items-center justify-center"
          >
            <Plus size={22} color="#999999" />
          </View>
        </Reveal>
      </View>
    </View>
  );
}
