import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { File } from 'expo-file-system';
import { ThemedText as Text, ThemedTextInput as TextInput } from './ThemedText';
import {
  loadSavedMedia,
  removeSavedMedia,
  saveDirectMediaLink,
  saveLocalMedia,
} from '../storage/mediaSaverStorage';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';

const categories = [
  { id: 'audio', label: 'ÁUDIO' },
  { id: 'video', label: 'VÍDEO' },
  { id: 'story', label: 'STORY' },
];

const categoryNames = {
  audio: 'AUDIO',
  video: 'VIDEO',
  story: 'STORY',
};

function MediaSaverItem({ item, onOpen, onRemove, theme }) {
  return (
    <View style={[styles.savedItem, { borderColor: theme.colors.panelBorder }]}>
      <View style={styles.itemCopy}>
        <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
        <Text style={[styles.itemMeta, { color: theme.colors.electricGreen }]}>
          {categoryNames[item.type]}{item.missing ? ' · FILE MISSING' : ' · ON THIS DEVICE'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.title}`}
        disabled={item.missing}
        onPress={() => onOpen(item)}
        style={[styles.itemAction, item.missing && styles.disabled]}
      >
        <Text style={[styles.itemActionText, { color: theme.colors.cyberYellow }]}>OPEN</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item.title} from Baixar`}
        onPress={() => onRemove(item)}
        style={styles.itemAction}
      >
        <Text style={styles.removeActionText}>×</Text>
      </Pressable>
    </View>
  );
}

export default function MediaSaver() {
  const { theme } = useM7Theme('hub');
  const [visible, setVisible] = useState(false);
  const [category, setCategory] = useState('audio');
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const refreshItems = useCallback(async () => {
    try {
      setItems(await loadSavedMedia());
      setError('');
    } catch (loadError) {
      const detail = loadError instanceof Error ? ` ${loadError.message}` : '';
      setError(`Could not read the local media library.${detail}`);
    }
  }, []);

  useEffect(() => {
    refreshItems();
  }, [refreshItems]);

  async function handlePickFile() {
    setBusy(true);
    setError('');
    try {
      const result = await File.pickFileAsync({
        mimeTypes: ['audio/*', 'video/*', 'image/*'],
      });
      if (result.canceled) {
        return;
      }

      const item = await saveLocalMedia(result.result, category, title);
      setItems(current => [item, ...current]);
      setTitle('');
    } catch (saveError) {
      const detail = saveError instanceof Error ? ` ${saveError.message}` : '';
      setError(`Media could not be saved.${detail}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveLink() {
    if (busy) {
      return;
    }

    setBusy(true);
    setError('');
    try {
      const item = await saveDirectMediaLink(link, category, title);
      setItems(current => [item, ...current]);
      setLink('');
      setTitle('');
    } catch (saveError) {
      const detail = saveError instanceof Error ? ` ${saveError.message}` : '';
      setError(`Media link could not be saved.${detail}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenItem(item) {
    setError('');
    try {
      const file = new File(item.uri);
      if (await File.canPreview(file)) {
        await File.preview(file, { title: item.title });
      } else {
        setError('This device cannot preview the selected file type.');
      }
    } catch (openError) {
      const detail = openError instanceof Error ? ` ${openError.message}` : '';
      setError(`The saved file could not be opened.${detail}`);
    }
  }

  async function handleRemoveItem(item) {
    setError('');
    try {
      await removeSavedMedia(item.id);
      setItems(current => current.filter(savedItem => savedItem.id !== item.id));
    } catch (removeError) {
      const detail = removeError instanceof Error ? ` ${removeError.message}` : '';
      setError(`The saved file could not be removed.${detail}`);
    }
  }

  return (
    <View style={[styles.section, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>BAIXAR</Text>
        <Text style={styles.sectionDescription}>
          Save your audio, videos, and stories to this device.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open Baixar media saver, ${items.length} saved`}
        onPress={() => {
          setVisible(true);
          refreshItems();
        }}
        style={({ pressed }) => [
          styles.openButton,
          { backgroundColor: theme.colors.electricGreen },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.openButtonText, { color: theme.colors.background }]}>
          OPEN SAVER · {String(items.length).padStart(2, '0')}
        </Text>
      </Pressable>

      <Modal
        animationType="slide"
        onRequestClose={() => setVisible(false)}
        presentationStyle="pageSheet"
        visible={visible}
      >
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalEyebrow, { color: theme.colors.electricGreen }]}>M7 LOCAL LIBRARY</Text>
              <Text style={styles.modalTitle}>Baixar</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close Baixar media saver"
              onPress={() => setVisible(false)}
              style={[styles.closeButton, { borderColor: theme.colors.panelBorder }]}
            >
              <Text style={styles.closeGlyph}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.fieldLabel}>MEDIA TYPE</Text>
            <View style={styles.categoryRow}>
              {categories.map(option => {
                const selected = category === option.id;
                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setCategory(option.id)}
                    style={[
                      styles.categoryButton,
                      { borderColor: selected ? theme.colors.electricGreen : theme.colors.panelBorder },
                      selected && { backgroundColor: `${theme.colors.electricGreen}18` },
                    ]}
                  >
                    <Text style={[styles.categoryText, selected && { color: theme.colors.electricGreen }]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>TITLE · OPTIONAL</Text>
            <TextInput
              accessibilityLabel="Saved media title"
              maxLength={70}
              onChangeText={setTitle}
              placeholder="Name this media"
              placeholderTextColor={theme.colors.mutedText}
              style={[styles.input, { borderColor: theme.colors.panelBorder, color: theme.colors.text }]}
              value={title}
            />

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={handlePickFile}
              style={[
                styles.pickButton,
                { borderColor: theme.colors.deepNeonPurple, backgroundColor: theme.colors.surface },
                busy && styles.disabled,
              ]}
            >
              <Text style={[styles.pickGlyph, { color: theme.colors.deepNeonPurple }]}>＋</Text>
              <View style={styles.pickCopy}>
                <Text style={styles.pickTitle}>CHOOSE FROM DEVICE</Text>
                <Text style={styles.pickDescription}>Copy an audio, video, or image file into Mence.</Text>
              </View>
              {busy ? <ActivityIndicator color={theme.colors.electricGreen} /> : null}
            </Pressable>

            <Text style={styles.fieldLabel}>OR PASTE A DIRECT HTTPS MEDIA LINK</Text>
            <TextInput
              accessibilityLabel="Direct HTTPS media link"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              onChangeText={setLink}
              placeholder="https://example.com/track.mp3"
              placeholderTextColor={theme.colors.mutedText}
              style={[styles.input, { borderColor: theme.colors.panelBorder, color: theme.colors.text }]}
              value={link}
            />
            <Pressable
              accessibilityRole="button"
              disabled={busy || !link.trim()}
              onPress={handleSaveLink}
              style={[
                styles.saveButton,
                { backgroundColor: theme.colors.electricGreen },
                (busy || !link.trim()) && styles.disabled,
              ]}
            >
              <Text style={[styles.saveButtonText, { color: theme.colors.background }]}>
                {busy ? 'SAVING LOCALLY…' : 'DOWNLOAD TO DEVICE'}
              </Text>
            </Pressable>
            <Text style={styles.disclaimer}>
              Only direct HTTPS links to media files are accepted. Social-platform pages and protected streams are not downloaded.
            </Text>

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}

            <View style={styles.libraryHeading}>
              <Text style={styles.fieldLabel}>SAVED ON THIS DEVICE</Text>
              <Text style={[styles.libraryCount, { color: theme.colors.cyberYellow }]}>
                {String(items.length).padStart(2, '0')}
              </Text>
            </View>
            {items.length > 0 ? items.map(item => (
              <MediaSaverItem
                key={item.id}
                item={item}
                onOpen={handleOpenItem}
                onRemove={handleRemoveItem}
                theme={theme}
              />
            )) : (
              <Text style={styles.emptyState}>Your saved media will appear here.</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderRadius: 11,
    padding: 12,
    gap: 12,
  },
  sectionCopy: {
    gap: 4,
  },
  sectionTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  sectionDescription: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 10,
  },
  openButton: {
    minHeight: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openButtonText: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.9,
  },
  pressed: {
    opacity: 0.75,
  },
  modal: {
    flex: 1,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#34313C',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalEyebrow: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 1.2,
  },
  modalTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 23,
    marginTop: 3,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    color: m7Theme.colors.text,
    fontSize: 23,
    lineHeight: 25,
  },
  modalContent: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 32,
    gap: 10,
  },
  fieldLabel: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.9,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 3,
  },
  categoryButton: {
    minHeight: 34,
    minWidth: 78,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: '#B9B7C1',
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.7,
  },
  input: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    fontFamily: m7Theme.fonts.body,
    fontSize: 11,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 58,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  pickGlyph: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 23,
    marginRight: 10,
  },
  pickCopy: {
    flex: 1,
    gap: 3,
  },
  pickTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  pickDescription: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 8,
  },
  saveButton: {
    minHeight: 40,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  disclaimer: {
    color: '#777480',
    fontFamily: m7Theme.fonts.body,
    fontSize: 8,
    lineHeight: 13,
  },
  error: {
    color: '#FF8B8B',
    fontFamily: m7Theme.fonts.body,
    fontSize: 9,
    lineHeight: 14,
  },
  libraryHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 7,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#34313C',
  },
  libraryCount: {
    fontFamily: m7Theme.fonts.display,
    fontSize: 14,
  },
  savedItem: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemCopy: {
    flex: 1,
    paddingVertical: 8,
  },
  itemTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 10,
  },
  itemMeta: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 7,
    letterSpacing: 0.5,
    marginTop: 3,
  },
  itemAction: {
    minWidth: 38,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },
  itemActionText: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
  },
  removeActionText: {
    color: '#A9A5B0',
    fontFamily: m7Theme.fonts.body,
    fontSize: 20,
  },
  emptyState: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 10,
    paddingVertical: 12,
  },
});
