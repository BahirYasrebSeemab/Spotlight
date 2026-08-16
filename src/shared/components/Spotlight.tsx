import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface SpotlightProps {
  style?: ViewStyle;
  intensity?: number; // 0-1, controls how strong the spotlight is
  children: React.ReactNode;
}

/**
 * Spotlight component that creates a radial gradient effect
 * Light comes from the top center, creating a spotlight effect
 */
export function Spotlight({ children, intensity = 0.3, style }: SpotlightProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Content */}
      <View style={styles.content}>{children}</View>
      {/* Spotlight gradient overlay - light from top center */}
      <LinearGradient
        colors={[
          `rgba(255, 255, 255, ${intensity})`, // Bright at top center
          `rgba(255, 255, 255, ${intensity * 0.6})`, // Medium bright
          `rgba(255, 255, 255, ${intensity * 0.3})`, // Fading
          'rgba(0, 0, 0, 0)', // Transparent at bottom
        ]}
        locations={[0, 0.15, 0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
});
