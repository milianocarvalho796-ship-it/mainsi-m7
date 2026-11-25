import React, { useMemo } from 'react';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Orbitron_400Regular } from '@expo-google-fonts/orbitron/400Regular';
import { Orbitron_500Medium } from '@expo-google-fonts/orbitron/500Medium';
import { Orbitron_700Bold } from '@expo-google-fonts/orbitron/700Bold';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono/400Regular';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono/700Bold';
import { SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk/400Regular';
import { SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk/500Medium';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk/700Bold';
import { Text, View } from 'react-native';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { M7ThemeProvider, useM7Theme } from './src/theme/M7ThemeProvider';

function AppNavigation() {
  const { theme } = useM7Theme();
  const [fontsLoaded, fontError] = useFonts({
    Orbitron_400Regular,
    Orbitron_500Medium,
    Orbitron_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const navigationTheme = useMemo(() => ({
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.colors.electricGreen,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.deepNeonPurple,
      notification: theme.colors.cyberYellow,
    },
  }), [theme]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <NavigationContainer
        documentTitle={{
          formatter: options => (options?.title ? `${options.title} | Mence.` : 'Mence.'),
        }}
        theme={navigationTheme}
      >
        <BottomTabNavigator />
      </NavigationContainer>
      {fontError ? (
        <Text
          accessibilityRole="alert"
          style={{
            color: theme.colors.cyberYellow,
            backgroundColor: theme.colors.background,
            padding: 8,
            textAlign: 'center',
          }}
        >
          Custom fonts unavailable; using platform fallback.
        </Text>
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <M7ThemeProvider>
      <AppNavigation />
    </M7ThemeProvider>
  );
}
