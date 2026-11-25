import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText as Text } from './ThemedText';
import { useM7Theme } from '../theme/M7ThemeProvider';

export default function EncryptionOverlay({ compact = false, wallpaperScope }) {
  const { theme } = useM7Theme(wallpaperScope);

  return (
    <View
      accessible
      accessibilityLabel="Simulated end-to-end encryption indicator. Messages are not cryptographically encrypted."
      style={[
        styles.badge,
        {
          borderColor: `${theme.colors.electricGreen}55`,
          backgroundColor: `${theme.colors.electricGreen}0D`,
        },
        compact && styles.compactBadge,
      ]}
    >
      <View style={[styles.lockBox, { backgroundColor: `${theme.colors.electricGreen}1A` }]}>
        <Text style={[styles.lockGlyph, { color: theme.colors.electricGreen }]}>⌑</Text>
      </View>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: theme.colors.electricGreen }]}>
          MIL-GRADE E2EE · SIMULATED
        </Text>
        <Text numberOfLines={compact ? 1 : 2} style={styles.disclaimer}>
          Demo indicator only · messages are not cryptographically encrypted.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 6,
    gap: 8,
  },
  compactBadge: {
    minHeight: 35,
    flex: 1,
    paddingHorizontal: 7,
  },
  lockBox: {
    width: 25,
    height: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockGlyph: {
    fontSize: 15,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    letterSpacing: 0.7,
  },
  disclaimer: {
    color: '#AAA6B2',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 7,
    lineHeight: 10,
  },
});
