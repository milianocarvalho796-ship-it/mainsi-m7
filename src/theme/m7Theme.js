const colors = {
  background: '#07070B',
  electricGreen: '#00FF66',
  cyberYellow: '#FFE600',
  deepNeonPurple: '#9D00FF',
  text: '#FFFFFF',
  mutedText: '#8B8B96',
};

const themeOptions = {
  bubbleColors: [
    { id: 'cyberYellow', label: 'Yellow', color: colors.cyberYellow, textColor: '#17140A' },
    { id: 'electricGreen', label: 'Green', color: colors.electricGreen, textColor: '#07170D' },
    { id: 'deepNeonPurple', label: 'Purple', color: colors.deepNeonPurple, textColor: '#FFFFFF' },
  ],
  wallpapers: [
    { id: 'oled', label: 'OLED', background: colors.background, surface: '#101016' },
    { id: 'deepSpace', label: 'Deep Space', background: '#0B0912', surface: '#15101D' },
    { id: 'gridNight', label: 'Grid Night', background: '#080D12', surface: '#111820' },
  ],
  neonIntensities: [
    { id: 'elegant', label: 'Elegant OLED', glowOpacity: 0.2, glowRadius: 3 },
    { id: 'balanced', label: 'Balanced', glowOpacity: 0.55, glowRadius: 8 },
    { id: 'vivid', label: 'Vivid', glowOpacity: 1, glowRadius: 15 },
  ],
  typography: [
    { id: 'spaceGrotesk', label: 'Space Grotesk' },
    { id: 'orbitron', label: 'Orbitron' },
  ],
};

const defaultThemePreferences = {
  bubbleColor: 'cyberYellow',
  wallpaper: 'oled',
  neonIntensity: 'balanced',
  typography: 'spaceGrotesk',
};

const fontFamilies = {
  spaceGrotesk: {
    body: 'SpaceGrotesk_400Regular',
    bodyMedium: 'SpaceGrotesk_500Medium',
    bodyBold: 'SpaceGrotesk_700Bold',
    display: 'SpaceGrotesk_700Bold',
  },
  orbitron: {
    body: 'Orbitron_400Regular',
    bodyMedium: 'Orbitron_500Medium',
    bodyBold: 'Orbitron_700Bold',
    display: 'Orbitron_700Bold',
  },
};

function findOption(options, id) {
  return options.find(option => option.id === id);
}

function normalizeThemePreferences(preferences = {}) {
  if (preferences === null || typeof preferences !== 'object' || Array.isArray(preferences)) {
    throw new TypeError('Theme preferences must be an object');
  }

  const normalized = { ...defaultThemePreferences, ...preferences };
  const validKeys = Object.keys(defaultThemePreferences);
  const unsupportedKeys = Object.keys(preferences).filter(key => !validKeys.includes(key));
  if (unsupportedKeys.length > 0) {
    throw new Error(`Unsupported theme preference: ${unsupportedKeys.join(', ')}`);
  }

  const validOptions = [
    ['bubbleColor', themeOptions.bubbleColors],
    ['wallpaper', themeOptions.wallpapers],
    ['neonIntensity', themeOptions.neonIntensities],
    ['typography', themeOptions.typography],
  ];

  for (const [key, options] of validOptions) {
    if (!findOption(options, normalized[key])) {
      throw new Error(`Unsupported ${key} theme preference: ${normalized[key]}`);
    }
  }

  return {
    bubbleColor: normalized.bubbleColor,
    wallpaper: normalized.wallpaper,
    neonIntensity: normalized.neonIntensity,
    typography: normalized.typography,
  };
}

function createM7Theme(preferences = defaultThemePreferences) {
  const normalizedPreferences = normalizeThemePreferences(preferences);
  const bubble = findOption(themeOptions.bubbleColors, normalizedPreferences.bubbleColor);
  const wallpaper = findOption(themeOptions.wallpapers, normalizedPreferences.wallpaper);
  const intensity = findOption(themeOptions.neonIntensities, normalizedPreferences.neonIntensity);

  return {
    colors: {
      ...colors,
      background: wallpaper.background,
      surface: wallpaper.surface,
      chatBubble: bubble.color,
      chatBubbleText: bubble.textColor,
    },
    fonts: {
      ...fontFamilies[normalizedPreferences.typography],
      families: {
        spaceGrotesk: 'Space Grotesk',
        orbitron: 'Orbitron',
      },
    },
    effects: {
      neonIntensity: intensity.glowOpacity,
      glowRadius: intensity.glowRadius,
    },
    preferences: normalizedPreferences,
  };
}

const m7Theme = createM7Theme();

export {
  colors,
  createM7Theme,
  defaultThemePreferences,
  fontFamilies,
  normalizeThemePreferences,
  themeOptions,
};
export default m7Theme;
