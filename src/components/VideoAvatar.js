import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';
import ThemedText from './ThemedText';

function VideoAvatar({
  initials = 'M7',
  size = 56,
  accentColor = m7Theme.colors.electricGreen,
  isActive = false,
  neonIntensity,
  accessibilityLabel,
}) {
  const { theme } = useM7Theme();
  const animation = useRef(new Animated.Value(0)).current;
  const intensity = neonIntensity ?? theme.effects.neonIntensity;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animation]);

  const glowOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.42 * intensity],
  });
  const scanOffset = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 0.28, size * 0.28],
  });

  return (
    <View
      accessibilityLabel={accessibilityLabel || `Looping avatar for ${initials}`}
      accessibilityRole="image"
      style={{ width: size, height: size }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            borderColor: accentColor,
            opacity: glowOpacity,
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1.12],
                }),
              },
            ],
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: accentColor,
            padding: Math.max(2, size * 0.07),
            shadowColor: accentColor,
            shadowOpacity: 0.2 * intensity,
            shadowRadius: theme.effects.glowRadius,
          },
        ]}
      >
        <View
          style={[
            styles.core,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: size / 2,
            },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.scanLine,
              {
                backgroundColor: accentColor,
                opacity: glowOpacity,
                transform: [{ translateY: scanOffset }],
              },
            ]}
          />
          <View style={[styles.innerRing, { borderColor: `${accentColor}55` }]} />
          <ThemedText style={[styles.initials, { fontSize: size * 0.25 }]}>
            {initials}
          </ThemedText>
          {isActive && <View style={[styles.activeDot, { backgroundColor: m7Theme.colors.electricGreen }]} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 999,
  },
  ring: {
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  core: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  innerRing: {
    ...StyleSheet.absoluteFillObject,
    margin: '18%',
    borderWidth: 1,
    borderRadius: 999,
  },
  initials: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    textAlign: 'center',
  },
  activeDot: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: m7Theme.colors.background,
  },
});

export default VideoAvatar;
