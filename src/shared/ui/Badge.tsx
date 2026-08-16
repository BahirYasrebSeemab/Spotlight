import { View, Text } from 'react-native';
import { BadgeCheckIcon } from 'lucide-react-native';

import { cn } from './cn';

export interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export function VerifiedBadge({ size = 18, className }: VerifiedBadgeProps) {
  return (
    <View className={cn('bg-black rounded-full p-0.5', className)}>
      <BadgeCheckIcon size={size} color="black" fill="white" />
    </View>
  );
}

export interface PillBadgeProps {
  label: string;
  className?: string;
  variant?: 'solid' | 'subtle';
}

export function PillBadge({ label, variant = 'subtle', className }: PillBadgeProps) {
  return (
    <View
      className={cn('px-3 py-1 rounded-full self-start', variant === 'solid' ? 'bg-primary' : 'bg-white/10', className)}
    >
      <Text
        className={cn('text-xs font-semibold', variant === 'solid' ? 'text-primary-foreground' : 'text-foreground')}
      >
        {label}
      </Text>
    </View>
  );
}
