import { Image, View, Text } from 'react-native';

import { cn } from './cn';

export interface AvatarProps {
  size?: number;
  label?: string;
  className?: string;
  uri?: string | null;
}

export function Avatar({ uri, label, size = 40, className }: AvatarProps) {
  const dimension = { height: size, width: size };

  if (uri) {
    return <Image source={{ uri }} style={dimension} className={cn('rounded-full bg-muted', className)} />;
  }

  const initial = label?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <View style={dimension} className={cn('rounded-full bg-white items-center justify-center', className)}>
      <Text className="text-black font-bold" style={{ fontSize: size * 0.4 }}>
        {initial}
      </Text>
    </View>
  );
}
