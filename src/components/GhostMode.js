import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText as Text } from './ThemedText';
import { useM7Theme } from '../theme/M7ThemeProvider';

function GhostModeToggle({ compact = false, wallpaperScope }) {
  const { theme, preferences, updatePreference, isReady } = useM7Theme(wallpaperScope);
  const enabled = preferences.ghostMode;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel="Ghost Mode"
      accessibilityState={{ checked: enabled, disabled: !isReady }}
      disabled={!isReady}
      onPress={() => updatePreference('ghostMode', !enabled)}
      style={[
        styles.toggle,
        {
          borderColor: enabled ? theme.colors.deepNeonPurple : theme.colors.panelBorder,
          backgroundColor: enabled ? `${theme.colors.deepNeonPurple}1A` : theme.colors.surface,
        },
        compact && styles.compactToggle,
        !isReady && styles.disabled,
      ]}
    >
      <Text style={[styles.toggleGlyph, { color: enabled ? theme.colors.deepNeonPurple : theme.colors.mutedText }]}>
        ◌
      </Text>
      <Text style={[styles.toggleText, { color: enabled ? theme.colors.deepNeonPurple : theme.colors.text }]}>
        {compact ? (enabled ? 'GHOST ON' : 'GHOST') : (enabled ? 'GHOST MODE ON' : 'GHOST MODE OFF')}
      </Text>
    </Pressable>
  );
}

function GhostMode({ children, style, wallpaperScope }) {
  const { theme, preferences, updatePreference, isReady } = useM7Theme(wallpaperScope);

  return (
    <View style={[styles.guard, style]}>
      {preferences.ghostMode ? (
        <View style={[styles.cover, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
          <View style={[styles.coverGlyph, { borderColor: theme.colors.deepNeonPurple }]}>
            <Text style={[styles.ghostGlyph, { color: theme.colors.deepNeonPurple }]}>◌</Text>
          </View>
          <Text style={styles.coverEyebrow}>M7 · GHOST MODE</Text>
          <Text style={styles.coverTitle}>Screen disguised</Text>
          <Text style={styles.coverDescription}>
            Conversations are hidden in this local view. This does not lock or encrypt device data.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Restore local conversations"
            disabled={!isReady}
            onPress={() => updatePreference('ghostMode', false)}
            style={[
              styles.revealButton,
              { backgroundColor: theme.colors.deepNeonPurple },
              !isReady && styles.disabled,
            ]}
          >
            <Text style={styles.revealText}>RESTORE LOCAL VIEW</Text>
          </Pressable>
        </View>
      ) : children}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderRadius: 9,
  },
  compactToggle: {
    minHeight: 30,
    paddingHorizontal: 7,
  },
  toggleGlyph: {
    fontSize: 14,
    lineHeight: 16,
  },
  toggleText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 7,
    letterSpacing: 0.6,
  },
  guard: {
    flex: 1,
  },
  cover: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    borderWidth: 1,
    borderRadius: 16,
  },
  coverGlyph: {
    width: 54,
    height: 54,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  ghostGlyph: {
    fontSize: 29,
  },
  coverEyebrow: {
    color: '#A18FB3',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    letterSpacing: 1.4,
  },
  coverTitle: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 19,
    marginTop: 7,
  },
  coverDescription: {
    color: '#A6A2AE',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  revealButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    paddingHorizontal: 14,
    marginTop: 17,
  },
  revealText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 8,
    letterSpacing: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export { GhostModeToggle };
export default GhostMode;
