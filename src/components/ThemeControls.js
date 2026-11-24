import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import m7Theme, { themeOptions } from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';
import ThemedText from './ThemedText';

function OptionRow({ label, options, selected, onSelect, disabled, colorKey }) {
  return (
    <View style={styles.optionGroup}>
      <ThemedText style={styles.optionLabel}>{label}</ThemedText>
      <ScrollView
        horizontal
        contentContainerStyle={styles.options}
        showsHorizontalScrollIndicator={false}
      >
        {options.map(option => {
          const isSelected = selected === option.id;
          const accent = option[colorKey] || m7Theme.colors.electricGreen;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${option.label}`}
              accessibilityState={{ selected: isSelected, disabled }}
              disabled={disabled}
              onPress={() => onSelect(option.id)}
              style={[
                styles.option,
                isSelected && { borderColor: accent, backgroundColor: `${accent}18` },
                disabled && styles.disabledOption,
              ]}
            >
              {colorKey ? <View style={[styles.colorSwatch, { backgroundColor: accent }]} /> : null}
              <ThemedText style={[styles.optionText, isSelected && styles.selectedText]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default function ThemeControls() {
  const {
    preferences,
    updatePreference,
    isReady,
    saveStatus,
    storageError,
    theme,
  } = useM7Theme();

  let statusLabel = 'SAVED TO DEVICE';
  if (!isReady) {
    statusLabel = 'LOADING SETTINGS';
  } else if (storageError || saveStatus === 'error') {
    statusLabel = 'SAVE ERROR';
  } else if (saveStatus === 'saving') {
    statusLabel = 'SAVING';
  } else if (saveStatus === 'saved') {
    statusLabel = 'SAVED';
  }

  return (
    <View style={[styles.panel, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.heading}>
        <ThemedText style={styles.headingTitle}>APPEARANCE OVERRIDES</ThemedText>
        <ThemedText style={styles.statusLabel}>{statusLabel}</ThemedText>
      </View>

      <OptionRow
        label="BUBBLES"
        options={themeOptions.bubbleColors}
        selected={preferences.bubbleColor}
        onSelect={value => updatePreference('bubbleColor', value)}
        disabled={!isReady}
        colorKey="color"
      />
      <OptionRow
        label="WALLPAPER"
        options={themeOptions.wallpapers}
        selected={preferences.wallpaper}
        onSelect={value => updatePreference('wallpaper', value)}
        disabled={!isReady}
      />
      <OptionRow
        label="NEON"
        options={themeOptions.neonIntensities}
        selected={preferences.neonIntensity}
        onSelect={value => updatePreference('neonIntensity', value)}
        disabled={!isReady}
      />
      <OptionRow
        label="TYPE"
        options={themeOptions.typography}
        selected={preferences.typography}
        onSelect={value => updatePreference('typography', value)}
        disabled={!isReady}
      />

      {storageError ? (
        <ThemedText accessibilityRole="alert" style={styles.error}>
          {storageError}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderColor: '#292631',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 11,
    gap: 8,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 3,
  },
  headingTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.9,
  },
  statusLabel: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.6,
  },
  optionGroup: {
    gap: 5,
  },
  optionLabel: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  options: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 4,
  },
  option: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#383540',
    backgroundColor: '#0A0A0F',
  },
  disabledOption: {
    opacity: 0.55,
  },
  colorSwatch: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  optionText: {
    color: '#B9B7C1',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
  },
  selectedText: {
    color: m7Theme.colors.text,
  },
  error: {
    color: '#FF8B8B',
    fontFamily: m7Theme.fonts.body,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
});
