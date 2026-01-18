import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarSpotlightProps {
  children: React.ReactNode;
  size?: number; // Size of the avatar (for calculating spotlight)
  intensity?: number; // 0-1, controls how strong the spotlight is
  style?: ViewStyle;
}

/**
 * Spotlight component specifically for avatar/profile picture
 * Creates a bright circular light from top, centered on the avatar
 */
export function AvatarSpotlight({ children, size = 80, intensity = 0.4, style }: AvatarSpotlightProps) {
  const spotlightSize = size * 1.8; // Spotlight extends beyond avatar
  const spotlightRadius = spotlightSize / 2;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Avatar/Content */}
      <View style={styles.content}>{children}</View>
      
      {/* Circular spotlight overlay - bright light from top center */}
      <View
        style={[
          styles.spotlightOverlay,
          {
            width: spotlightSize,
            height: spotlightSize,
            borderRadius: spotlightRadius,
            top: -spotlightRadius * 0.3, // Position above center
            left: (size - spotlightSize) / 2,
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
            width: size + 4,
            height: size + 4,
            borderRadius: (size + 4) / 2,
            borderWidth: 1,
            borderColor: `rgba(255, 255, 255, ${intensity * 0.6})`,
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  spotlightOverlay: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 2,
  },
  brightRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    zIndex: 3,
  },
});
