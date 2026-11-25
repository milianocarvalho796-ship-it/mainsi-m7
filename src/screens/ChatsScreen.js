import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GhostMode, { GhostModeToggle } from '../components/GhostMode';
import VideoAvatar from '../components/VideoAvatar';
import { ThemedText as Text, ThemedTextInput as TextInput } from '../components/ThemedText';
import EncryptionOverlay from '../components/encryptionOverlay';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';

const conversations = [
  {
    id: 'nova-chen',
    name: 'Nova Chen',
    handle: '@nova.exe',
    initials: 'NC',
    online: true,
    unread: 2,
    time: 'now',
    preview: 'The signal is clean. Meet you at the east gate.',
    messages: [
      { id: 'nova-1', sender: 'them', text: 'You seeing this light over the district?', time: '9:40 PM' },
      { id: 'nova-2', sender: 'me', text: 'Signal is clean on my end. Where are you?', time: '9:41 PM' },
      { id: 'nova-3', sender: 'them', text: 'The east gate. Meet you there.', time: '9:42 PM' },
    ],
  },
  {
    id: 'kai-mori',
    name: 'Kai Mori',
    handle: '@kairo_7',
    initials: 'KM',
    online: true,
    unread: 0,
    time: '4m',
    preview: 'Keys rotated. Channel is yours.',
    messages: [
      { id: 'kai-1', sender: 'them', text: 'Keys rotated. Channel is yours.', time: '9:36 PM' },
      { id: 'kai-2', sender: 'me', text: 'Copy. Keeping this channel private.', time: '9:37 PM' },
    ],
  },
  {
    id: 'mika-zero',
    name: 'Mika Zero',
    handle: '@mika.zero',
    initials: 'MZ',
    online: false,
    unread: 0,
    time: '1h',
    preview: 'Sent you the night-run playlist 🎧',
    messages: [
      { id: 'mika-1', sender: 'them', text: 'Sent you the night-run playlist 🎧', time: '8:22 PM' },
    ],
  },
  {
    id: 'ghost-unit',
    name: 'Ghost Unit',
    handle: '@ghost.unit',
    initials: 'GU',
    online: false,
    unread: 0,
    time: '3h',
    preview: 'No trace left behind. As promised.',
    messages: [
      { id: 'ghost-1', sender: 'them', text: 'No trace left behind. As promised.', time: '6:10 PM' },
    ],
  },
];

function ConversationRow({ conversation, onPress, theme }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open chat with ${conversation.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.conversation, pressed && styles.conversationPressed]}
    >
      <View style={styles.avatarWrap}>
        <VideoAvatar
          accessibilityLabel={`${conversation.name} looping avatar`}
          accentColor={
            conversation.online && !theme.preferences.ghostMode
              ? theme.colors.electricGreen
              : theme.colors.deepNeonPurple
          }
          initials={conversation.initials}
          isActive={conversation.online && !theme.preferences.ghostMode}
          neonIntensity={theme.effects.neonIntensity}
          wallpaperScope="chats"
          size={46}
        />
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.nameLine}>
          <Text style={styles.name}>{conversation.name}</Text>
          <Text style={styles.time}>
            {theme.preferences.ghostMode ? '—' : conversation.time}
          </Text>
        </View>
        <Text style={styles.handle}>{conversation.handle}</Text>
        <View style={styles.previewLine}>
          <Text numberOfLines={1} style={styles.preview}>
            {conversation.preview}
          </Text>
          {conversation.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{conversation.unread}</Text>
            </View>
          )}
        </View>
        <View style={styles.encryptedLabel}>
          <Text style={styles.lockGlyph}>⌑</Text>
          <Text style={styles.encryptedText}>PRIVATE THREAD</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function ChatsScreen({ navigation }) {
  const { theme, preferences } = useM7Theme('chats');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredConversations = conversations.filter(conversation =>
    `${conversation.name} ${conversation.handle} ${conversation.preview}`
      .toLowerCase()
      .includes(normalizedQuery),
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Mence. / @voce.mence</Text>
          <Text style={styles.title}>Chats</Text>
        </View>
        <View style={styles.securePill}>
          <Text style={styles.secureGlyph}>⌑</Text>
          <Text style={styles.secureText}>M7 LOCAL</Text>
        </View>
      </View>

      <View style={styles.securityBanner}>
        <View style={styles.securityBadgeRow}>
          <EncryptionOverlay compact wallpaperScope="chats" />
          <GhostModeToggle compact wallpaperScope="chats" />
        </View>
        <View style={styles.securityStatusRow}>
          <View style={styles.securityDot} />
          <Text style={styles.securityMessage}>
            {preferences.ghostMode
              ? 'GHOST MODE · PRESENCE HIDDEN IN THIS UI'
              : 'PRIVATE CHANNELS · LOCAL OUTBOX AVAILABLE'}
          </Text>
        </View>
      </View>

      <GhostMode style={styles.chatArea} wallpaperScope="chats">
        <>
          <View style={[styles.searchBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
            <Text style={styles.searchGlyph}>⌕</Text>
            <TextInput
              accessibilityLabel="Search chats"
              onChangeText={setQuery}
              placeholder="Search contacts or messages"
              placeholderTextColor={m7Theme.colors.mutedText}
              returnKeyType="search"
              style={styles.searchInput}
              value={query}
            />
          </View>

          <View style={styles.listHeading}>
            <Text style={styles.listTitle}>MESSAGES</Text>
            <Text style={[styles.onlineCount, { color: theme.colors.electricGreen }]}>
              {preferences.ghostMode
                ? 'GHOST MODE'
                : `${conversations.filter(conversation => conversation.online).length} ONLINE`}
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {filteredConversations.map(conversation => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                theme={theme}
                onPress={() => navigation.navigate('ChatDetail', { conversation })}
              />
            ))}
            {filteredConversations.length === 0 && (
              <Text style={styles.emptyState}>NO SIGNALS MATCH THAT SEARCH</Text>
            )}
          </ScrollView>

          <View style={styles.queueFooter}>
            <View style={styles.queueDot} />
            <Text style={styles.queueFooterText}>OFFLINE MESSAGE QUEUE READY</Text>
          </View>
        </>
      </GhostMode>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: m7Theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  title: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 25,
    marginTop: 4,
  },
  securePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#22452F',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  secureGlyph: {
    color: m7Theme.colors.electricGreen,
    fontSize: 13,
  },
  secureText: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 1,
  },
  securityBanner: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#173421',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#0B130E',
    gap: 7,
  },
  securityBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  securityStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 2,
  },
  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: m7Theme.colors.electricGreen,
  },
  securityMessage: {
    color: '#A8D8B8',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 0.7,
  },
  chatArea: {
    flex: 1,
  },
  searchBox: {
    height: 44,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#292731',
    backgroundColor: '#101016',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchGlyph: {
    color: m7Theme.colors.mutedText,
    fontSize: 20,
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.body,
    fontSize: 13,
  },
  listHeading: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  onlineCount: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  conversation: {
    minHeight: 98,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#282630',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  conversationPressed: {
    opacity: 0.7,
  },
  avatarWrap: {
    width: 50,
    height: 50,
    justifyContent: 'center',
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 14,
  },
  time: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 10,
  },
  handle: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
  previewLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  preview: {
    color: '#C4C2CB',
    fontFamily: m7Theme.fonts.body,
    fontSize: 11,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: m7Theme.colors.electricGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCount: {
    color: m7Theme.colors.background,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
  },
  encryptedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    gap: 4,
  },
  lockGlyph: {
    color: m7Theme.colors.electricGreen,
    fontSize: 10,
  },
  encryptedText: {
    color: '#78A889',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.7,
  },
  emptyState: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
    paddingVertical: 40,
  },
  queueFooter: {
    minHeight: 38,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#282630',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  queueDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: m7Theme.colors.electricGreen,
  },
  queueFooterText: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1,
  },
});
