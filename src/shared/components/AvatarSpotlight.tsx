import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface AvatarSpotlightProps {
  size?: number; // Size of the avatar (for calculating spotlight)
  style?: ViewStyle;
  intensity?: number; // 0-1, controls how strong the spotlight is
  children: React.ReactNode;
}

/**
 * Spotlight component specifically for avatar/profile picture
 * Creates a bright circular light from top, centered on the avatar
 */
export function AvatarSpotlight({ children, intensity = 0.4, size = 80, style }: AvatarSpotlightProps) {
  const spotlightSize = size * 1.8; // Spotlight extends beyond avatar
  const spotlightRadius = spotlightSize / 2;

  return (
    <View style={[styles.container, { height: size, width: size }, style]}>
      {/* Avatar/Content */}
      <View style={styles.content}>{children}</View>

      {/* Circular spotlight overlay - bright light from top center */}
      <View
        style={[
          styles.spotlightOverlay,
          {
            borderRadius: spotlightRadius,
            height: spotlightSize,
            left: (size - spotlightSize) / 2,
            top: -spotlightRadius * 0.3, // Position above center
            width: spotlightSize,
          },
        ]}
        pointerEvents="none"
      >
        <LinearGradient
          colors={[
            `rgba(255, 255, 255, ${intensity})`, // Very bright at top center
            `rgba(255, 255, 255, ${intensity * 0.7})`, // Bright
            `rgba(255, 255, 255, ${intensity * 0.3})`, // Medium
            `rgba(255, 255, 255, ${intensity * 0.1})`, // Fading
            'rgba(0, 0, 0, 0)', // Transparent at edges
          ]}
          locations={[0, 0.2, 0.4, 0.6, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Thin bright ring around the avatar */}
      <View
        style={[
          styles.brightRing,
          {
            borderColor: `rgba(255, 255, 255, ${intensity * 0.6})`,
            borderRadius: (size + 4) / 2,
            borderWidth: 1,
            height: size + 4,
            width: size + 4,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  brightRing: {
    left: -2,
    position: 'absolute',
    top: -2,
    zIndex: 3,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  content: {
    height: '100%',
    width: '100%',
    zIndex: 1,
  },
  spotlightOverlay: {
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 2,
  },
});
