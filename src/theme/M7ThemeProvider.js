import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadThemePreferences, saveThemePreferences } from '../storage/themeStorage';
import {
  createM7Theme,
  defaultThemePreferences,
  normalizeThemePreferences,
} from './m7Theme';

const M7ThemeContext = createContext(null);

function describeStorageError(error, action) {
  const detail = error instanceof Error ? ` ${error.message}` : '';
  return `Theme settings could not be ${action}.${detail}`;
}

function M7ThemeProvider({ children }) {
  const [preferences, setPreferences] = useState(defaultThemePreferences);
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle');
  const preferenceRef = useRef(defaultThemePreferences);
  const saveSequence = useRef(0);

  useEffect(() => {
    let active = true;

    async function restorePreferences() {
      try {
        const storedPreferences = await loadThemePreferences();
        if (active) {
          preferenceRef.current = storedPreferences;
          setPreferences(storedPreferences);
        }
      } catch (error) {
        if (active) {
          setStorageError(describeStorageError(error, 'loaded'));
        }
      } finally {
        if (active) {
          setIsReady(true);
        }
      }
    }

    restorePreferences();
    return () => {
      active = false;
    };
  }, []);

  const updatePreference = useCallback(async (key, value) => {
    if (!isReady) {
      throw new Error('Theme settings are still loading');
    }

    const preferenceChanges = { ...preferenceRef.current, [key]: value };
    if (key === 'neonIntensity' && value === 'elegant') {
      preferenceChanges.wallpaper = 'oled';
    } else if (
      key === 'wallpaper' &&
      value !== 'oled' &&
      preferenceRef.current.neonIntensity === 'elegant'
    ) {
      preferenceChanges.neonIntensity = 'balanced';
    }

    const updatedPreferences = normalizeThemePreferences(preferenceChanges);
    preferenceRef.current = updatedPreferences;
    setPreferences(updatedPreferences);

    const sequence = ++saveSequence.current;
    setSaveStatus('saving');
    setStorageError('');

    try {
      await saveThemePreferences(updatedPreferences);
      if (sequence === saveSequence.current) {
        setSaveStatus('saved');
      }
      return true;
    } catch (error) {
      if (sequence === saveSequence.current) {
        setSaveStatus('error');
        setStorageError(describeStorageError(error, 'saved'));
      }
      return false;
    }
  }, [isReady]);

  const theme = useMemo(() => createM7Theme(preferences), [preferences]);
  const contextValue = useMemo(() => ({
    theme,
    preferences,
    updatePreference,
    isReady,
    saveStatus,
    storageError,
  }), [theme, preferences, updatePreference, isReady, saveStatus, storageError]);

  return (
    <M7ThemeContext.Provider value={contextValue}>
      {children}
    </M7ThemeContext.Provider>
  );
}

function useM7Theme() {
  const context = React.useContext(M7ThemeContext);
  if (!context) {
    throw new Error('useM7Theme must be used within M7ThemeProvider');
  }
  return context;
}

export { M7ThemeProvider, useM7Theme };
