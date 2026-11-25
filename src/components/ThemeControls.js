import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { normalizeHexColor, themeOptions, wallpaperScopes } from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';
import ThemedText from './ThemedText';

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return {
    red: String(parseInt(value.slice(0, 2), 16)),
    green: String(parseInt(value.slice(2, 4), 16)),
    blue: String(parseInt(value.slice(4, 6), 16)),
  };
}

function rgbToHex({ red, green, blue }) {
  return `#${[red, green, blue]
    .map(value => Number(value).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function OptionRow({ label, options, selected, onSelect, disabled, colorKey, theme }) {
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
          const accent = option[colorKey] || theme.colors.electricGreen;
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
                { borderColor: isSelected ? accent : '#383540' },
                isSelected && { backgroundColor: `${accent}18` },
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

function PreferenceSwitch({ label, description, value, onValueChange, disabled, theme }) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceCopy}>
        <ThemedText style={styles.preferenceLabel}>{label}</ThemedText>
        <ThemedText style={styles.preferenceDescription}>{description}</ThemedText>
      </View>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: '#36333E', true: `${theme.colors.electricGreen}77` }}
        thumbColor={value ? theme.colors.electricGreen : '#9995A3'}
        value={value}
      />
    </View>
  );
}

export default function ThemeControls({ wallpaperScope } = {}) {
  const {
    preferences,
    updatePreference,
    isReady,
    saveStatus,
    storageError,
    theme,
  } = useM7Theme(wallpaperScope);
  const [hexDraft, setHexDraft] = useState(theme.colors.chatBubble);
  const [rgbDraft, setRgbDraft] = useState(() => hexToRgb(theme.colors.chatBubble));

  useEffect(() => {
    setHexDraft(theme.colors.chatBubble);
    setRgbDraft(hexToRgb(theme.colors.chatBubble));
  }, [theme.colors.chatBubble]);

  function updateHex(value) {
    const normalizedInput = value.trim().startsWith('#') ? value.trim() : `#${value.trim()}`;
    setHexDraft(value);
    if (/^#[0-9a-fA-F]{6}$/.test(normalizedInput)) {
      updatePreference('customBubbleColor', normalizeHexColor(normalizedInput));
    }
  }

  function updateRgb(channel, value) {
    const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 3);
    const nextRgb = { ...rgbDraft, [channel]: sanitizedValue };
    setRgbDraft(nextRgb);

    const channels = [nextRgb.red, nextRgb.green, nextRgb.blue];
    if (
      channels.every(item => /^\d{1,3}$/.test(item) && Number(item) <= 255)
    ) {
      updatePreference('customBubbleColor', rgbToHex(nextRgb));
    }
  }

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
    <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
      <View style={styles.heading}>
        <ThemedText style={styles.headingTitle}>GB CUSTOM HUB</ThemedText>
        <ThemedText style={[styles.statusLabel, { color: theme.colors.electricGreen }]}>{statusLabel}</ThemedText>
      </View>

      <OptionRow
        label="BUBBLE PRESETS"
        options={themeOptions.bubbleColors}
        selected={preferences.customBubbleColor ? null : preferences.bubbleColor}
        onSelect={value => updatePreference('bubbleColor', value)}
        disabled={!isReady}
        colorKey="color"
        theme={theme}
      />

      <View style={styles.colorEditor}>
        <View style={styles.colorEditorHeading}>
          <ThemedText style={styles.optionLabel}>LIVE HEX / RGB PICKER</ThemedText>
          <View style={[styles.previewSwatch, { backgroundColor: theme.colors.chatBubble }]} />
        </View>
        <View style={styles.colorInputRow}>
          <View style={styles.hexInputGroup}>
            <ThemedText style={styles.inputLabel}>HEX</ThemedText>
            <TextInput
              accessibilityLabel="Chat bubble HEX color"
              autoCapitalize="characters"
              autoCorrect={false}
              editable={isReady}
              maxLength={7}
              onChangeText={updateHex}
              placeholder="#00FF66"
              placeholderTextColor={theme.colors.mutedText}
              selectTextOnFocus
              style={[styles.colorInput, { color: theme.colors.text, borderColor: theme.colors.panelBorder }]}
              value={hexDraft}
            />
          </View>
          {[
            ['RED', 'red'],
            ['GREEN', 'green'],
            ['BLUE', 'blue'],
          ].map(([label, channel]) => (
            <View key={channel} style={styles.rgbInputGroup}>
              <ThemedText style={styles.inputLabel}>{label}</ThemedText>
              <TextInput
                accessibilityLabel={`Chat bubble RGB ${label.toLowerCase()} value`}
                editable={isReady}
                keyboardType="number-pad"
                maxLength={3}
                onChangeText={value => updateRgb(channel, value)}
                selectTextOnFocus
                style={[styles.colorInput, { color: theme.colors.text, borderColor: theme.colors.panelBorder }]}
                value={rgbDraft[channel]}
              />
            </View>
          ))}
        </View>
        <ThemedText style={styles.helperText}>Valid values update the chat preview immediately.</ThemedText>
      </View>

      <OptionRow
        label="WALLPAPER"
        options={themeOptions.wallpapers}
        selected={preferences.wallpaper}
        onSelect={value => updatePreference('wallpaper', value)}
        disabled={!isReady}
        theme={theme}
      />
      {(
        wallpaperScope
          ? wallpaperScopes.filter(scope => scope.id === wallpaperScope)
          : wallpaperScopes
      ).map(scope => (
        <OptionRow
          key={scope.id}
          label={`${scope.label} WALLPAPER`}
          options={[
            { id: 'global', label: 'GLOBAL' },
            ...themeOptions.wallpapers,
          ]}
          selected={preferences.screenWallpapers[scope.id] || 'global'}
          onSelect={value => updatePreference('screenWallpapers', {
            ...preferences.screenWallpapers,
            [scope.id]: value,
          })}
          disabled={!isReady}
          theme={theme}
        />
      ))}
      <OptionRow
        label="NEON INTENSITY"
        options={themeOptions.neonIntensities}
        selected={preferences.neonIntensity}
        onSelect={value => updatePreference('neonIntensity', value)}
        disabled={!isReady}
        theme={theme}
      />

      <View style={styles.lab}>
        <ThemedText style={styles.labTitle}>TYPOGRAPHY LAB</ThemedText>
        <ThemedText style={styles.labDescription}>Choose the type system used across M7.</ThemedText>
        <OptionRow
          label="FONT FAMILY"
          options={themeOptions.typography}
          selected={preferences.typography}
          onSelect={value => updatePreference('typography', value)}
          disabled={!isReady}
          theme={theme}
        />
        <ThemedText style={[styles.fontSample, { color: theme.colors.electricGreen }]}>
          M7 / SIGNAL 07 · LIVE PREVIEW
        </ThemedText>
      </View>

      <View style={styles.privacySection}>
        <ThemedText style={styles.labTitle}>LOCAL CHAT BEHAVIOR</ThemedText>
        <PreferenceSwitch
          label="Ghost mode"
          description="Hide presence indicators in this app's local UI."
          value={preferences.ghostMode}
          onValueChange={value => updatePreference('ghostMode', value)}
          disabled={!isReady}
          theme={theme}
        />
        <PreferenceSwitch
          label="Anti-delete"
          description="Retain received content if a thread's demo delete action is used."
          value={preferences.antiDelete}
          onValueChange={value => updatePreference('antiDelete', value)}
          disabled={!isReady}
          theme={theme}
        />
        <ThemedText style={styles.disclaimer}>
          Local display controls only; these do not connect to or alter WhatsApp or another service.
        </ThemedText>
      </View>

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
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 11,
    gap: 10,
  },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 3,
  },
  headingTitle: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    letterSpacing: 0.9,
  },
  statusLabel: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 8,
    letterSpacing: 0.6,
  },
  optionGroup: {
    gap: 5,
  },
  optionLabel: {
    color: '#8B8B96',
    fontFamily: 'SpaceGrotesk_700Bold',
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
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 8,
  },
  selectedText: {
    color: '#FFFFFF',
  },
  colorEditor: {
    gap: 7,
  },
  colorEditorHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewSwatch: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderColor: '#FFFFFF55',
    borderWidth: 1,
  },
  colorInputRow: {
    flexDirection: 'row',
    gap: 6,
  },
  hexInputGroup: {
    flex: 1.25,
    gap: 4,
  },
  rgbInputGroup: {
    flex: 0.65,
    gap: 4,
  },
  inputLabel: {
    color: '#8B8B96',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 7,
    letterSpacing: 0.6,
  },
  colorInput: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#09090E',
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
  },
  helperText: {
    color: '#8B8B96',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 8,
  },
  lab: {
    borderTopColor: '#393540',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 9,
    gap: 6,
  },
  labTitle: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    letterSpacing: 0.9,
  },
  labDescription: {
    color: '#8B8B96',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 9,
  },
  fontSample: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    letterSpacing: 0.4,
    paddingVertical: 4,
  },
  privacySection: {
    borderTopColor: '#393540',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 9,
    gap: 7,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  preferenceCopy: {
    flex: 1,
    paddingRight: 8,
  },
  preferenceLabel: {
    color: '#FFFFFF',
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
  },
  preferenceDescription: {
    color: '#8B8B96',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 8,
    lineHeight: 12,
    marginTop: 2,
  },
  disclaimer: {
    color: '#8B8B96',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 8,
    lineHeight: 12,
  },
  error: {
    color: '#FF8B8B',
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
});
