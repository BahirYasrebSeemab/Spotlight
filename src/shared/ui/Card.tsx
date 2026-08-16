import { ReactNode } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

import { cn } from './cn';
import { Avatar } from './Avatar';

export interface CardProps {
  title: string;
  meta?: ReactNode;
  right?: ReactNode;
  imageSize?: number;
  className?: string;
  imageLabel?: string;
  onPress?: () => void;
  subtitle?: ReactNode;
  imageBadge?: ReactNode;
  subtitleLines?: number;
  imageUri?: string | null;
  imageShape?: 'circle' | 'square';
}

export function Card({
  onPress,
  imageUri,
  imageLabel,
  imageShape = 'circle',
  imageSize = 56,
  imageBadge,
  title,
  subtitle,
  subtitleLines = 1,
  meta,
  right,
  className,
}: CardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className={cn('flex-row items-center p-4 border-b border-border', className)}
    >
      <View className="relative">
        {imageShape === 'circle' ? (
          <Avatar uri={imageUri} label={imageLabel} size={imageSize} className="border border-white/10" />
        ) : (
          <Image
            source={{ uri: imageUri ?? undefined }}
            style={{ height: imageSize, width: imageSize }}
            className="rounded-lg bg-muted border border-white/10"
          />
        )}
        {imageBadge && <View className="absolute -bottom-1 -right-1">{imageBadge}</View>}
      </View>

      <View className="flex-1 ml-3">
        <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {subtitle &&
          (typeof subtitle === 'string' ? (
            <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={subtitleLines}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          ))}
        {meta && (typeof meta === 'string' ? <Text className="text-xs text-muted-foreground mt-1">{meta}</Text> : meta)}
      </View>

      {right && <View className="ml-3">{right}</View>}
    </TouchableOpacity>
  );
}
