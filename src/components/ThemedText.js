import React from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';

function getFontRole(style) {
  const fontFamily = StyleSheet.flatten(style)?.fontFamily;
  if (fontFamily === m7Theme.fonts.display || fontFamily === m7Theme.fonts.bodyBold) {
    return 'bodyBold';
  }
  if (fontFamily === m7Theme.fonts.bodyMedium) {
    return 'bodyMedium';
  }
  return 'body';
}

function ThemedText({ style, ...props }) {
  const { theme } = useM7Theme();
  const fontFamily = theme.fonts[getFontRole(style)];
  return <Text {...props} style={[style, { fontFamily }]} />;
}

function ThemedTextInput({ style, ...props }) {
  const { theme } = useM7Theme();
  const fontFamily = theme.fonts[getFontRole(style)];
  return <TextInput {...props} style={[style, { fontFamily }]} />;
}

export { ThemedTextInput };
export default ThemedText;
