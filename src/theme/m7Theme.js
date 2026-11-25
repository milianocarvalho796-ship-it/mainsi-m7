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
    { id: 'jetBrainsMono', label: 'JetBrains Mono' },
  ],
};

const wallpaperScopes = [
  { id: 'chats', label: 'CHATS' },
  { id: 'chatDetail', label: 'CHAT DETAIL' },
  { id: 'feed', label: 'FEED' },
  { id: 'reels', label: 'REELS' },
  { id: 'hub', label: 'HUB' },
];

const defaultThemePreferences = {
  bubbleColor: 'cyberYellow',
  customBubbleColor: null,
  wallpaper: 'oled',
  screenWallpapers: Object.fromEntries(wallpaperScopes.map(({ id }) => [id, 'global'])),
  neonIntensity: 'balanced',
  typography: 'spaceGrotesk',
  ghostMode: false,
  antiDelete: false,
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
  jetBrainsMono: {
    body: 'JetBrainsMono_400Regular',
    bodyMedium: 'JetBrainsMono_500Medium',
    bodyBold: 'JetBrainsMono_700Bold',
    display: 'JetBrainsMono_700Bold',
  },
};

function normalizeHexColor(value) {
  if (typeof value !== 'string' || !/^#?[0-9a-fA-F]{6}$/.test(value)) {
    throw new Error('Custom bubble color must be a 6-digit HEX value');
  }

  return `#${value.replace('#', '').toUpperCase()}`;
}

function getReadableTextColor(hex) {
  const value = hex.replace('#', '');
  const red = parseInt(value.slice(0, 2), 16);
  const green = parseInt(value.slice(2, 4), 16);
  const blue = parseInt(value.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 150 ? '#111116' : '#FFFFFF';
}

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

  if (normalized.customBubbleColor !== null) {
    normalized.customBubbleColor = normalizeHexColor(normalized.customBubbleColor);
  }
  if (
    normalized.screenWallpapers === null ||
    typeof normalized.screenWallpapers !== 'object' ||
    Array.isArray(normalized.screenWallpapers)
  ) {
    throw new TypeError('screenWallpapers must be an object');
  }
  const screenWallpapers = { ...defaultThemePreferences.screenWallpapers };
  for (const [screen, wallpaperId] of Object.entries(normalized.screenWallpapers)) {
    if (!wallpaperScopes.some(scope => scope.id === screen)) {
      throw new Error(`Unsupported wallpaper screen: ${screen}`);
    }
    if (wallpaperId !== 'global' && !findOption(themeOptions.wallpapers, wallpaperId)) {
      throw new Error(`Unsupported wallpaper for ${screen}: ${wallpaperId}`);
    }
    screenWallpapers[screen] = wallpaperId;
  }
  for (const key of ['ghostMode', 'antiDelete']) {
    if (typeof normalized[key] !== 'boolean') {
      throw new Error(`${key} must be a boolean`);
    }
  }

  return {
    bubbleColor: normalized.bubbleColor,
    customBubbleColor: normalized.customBubbleColor,
    wallpaper: normalized.wallpaper,
    screenWallpapers,
    neonIntensity: normalized.neonIntensity,
    typography: normalized.typography,
    ghostMode: normalized.ghostMode,
    antiDelete: normalized.antiDelete,
  };
}

function createM7Theme(preferences = defaultThemePreferences, screenScope) {
  const normalizedPreferences = normalizeThemePreferences(preferences);
  const bubble = findOption(themeOptions.bubbleColors, normalizedPreferences.bubbleColor);
  const bubbleColor = normalizedPreferences.customBubbleColor || bubble.color;
  const screenWallpaper = screenScope
    ? normalizedPreferences.screenWallpapers[screenScope]
    : 'global';
  const wallpaperId = screenWallpaper && screenWallpaper !== 'global'
    ? screenWallpaper
    : normalizedPreferences.wallpaper;
  const wallpaper = findOption(themeOptions.wallpapers, wallpaperId);
  const intensity = findOption(themeOptions.neonIntensities, normalizedPreferences.neonIntensity);

  return {
    colors: {
      ...colors,
      background: wallpaper.background,
      surface: wallpaper.surface,
      panelBorder: '#292631',
      chatBubble: bubbleColor,
      chatBubbleText: normalizedPreferences.customBubbleColor
        ? getReadableTextColor(bubbleColor)
        : bubble.textColor,
    },
    fonts: {
      ...fontFamilies[normalizedPreferences.typography],
      families: {
        spaceGrotesk: 'Space Grotesk',
        orbitron: 'Orbitron',
        jetBrainsMono: 'JetBrains Mono',
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
  normalizeHexColor,
  themeOptions,
  wallpaperScopes,
};
export default m7Theme;
