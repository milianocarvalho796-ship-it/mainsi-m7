import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  defaultThemePreferences,
  normalizeThemePreferences,
} from '../theme/m7Theme';

const THEME_STORAGE_KEY = '@mainsi/m7/theme-preferences';

let pendingWrite = Promise.resolve();

async function loadThemePreferences() {
  const storedPreferences = await AsyncStorage.getItem(THEME_STORAGE_KEY);
  if (storedPreferences === null) {
    return { ...defaultThemePreferences };
  }

  return normalizeThemePreferences(JSON.parse(storedPreferences));
}

function saveThemePreferences(preferences) {
  const normalizedPreferences = normalizeThemePreferences(preferences);
  const write = pendingWrite.then(() =>
    AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(normalizedPreferences)),
  );
  pendingWrite = write.then(
    () => undefined,
    () => undefined,
  );

  return write.then(() => normalizedPreferences);
}

export { THEME_STORAGE_KEY, loadThemePreferences, saveThemePreferences };
