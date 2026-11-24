import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText as Text, ThemedTextInput as TextInput } from '../components/ThemedText';
import ThemeControls from '../components/ThemeControls';
import VideoAvatar from '../components/VideoAvatar';
import offlineQueue from '../storage/offlineQueue';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function MessageBubble({ message, theme }) {
  const outgoing = message.sender === 'me';
  const outgoingThemeStyle = outgoing
    ? {
        backgroundColor: theme.colors.chatBubble,
        shadowColor: theme.colors.chatBubble,
        shadowOpacity: 0.18 * theme.effects.neonIntensity,
        shadowRadius: theme.effects.glowRadius,
      }
    : {
        backgroundColor: theme.colors.surface,
        borderColor: `rgba(157, 0, 255, ${Math.max(0.15, theme.effects.neonIntensity * 0.4)})`,
      };

  return (
    <View style={[styles.messageRow, outgoing ? styles.outgoingRow : styles.incomingRow]}>
      <View style={[styles.messageBubble, outgoing ? styles.outgoingBubble : styles.incomingBubble, outgoingThemeStyle]}>
        <Text
          style={[
            styles.messageText,
            outgoing && styles.outgoingText,
            outgoing && { color: theme.colors.chatBubbleText },
          ]}
        >
          {message.text}
        </Text>
        <View style={styles.messageMeta}>
          {message.status === 'queued' && (
            <Text style={styles.queuedLabel}>QUEUED · </Text>
          )}
          <Text style={[styles.messageTime, outgoing && styles.outgoingTime]}>{message.time}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ChatDetailScreen({ navigation, route }) {
  const { theme } = useM7Theme();
  const conversation = route.params.conversation;
  const [messages, setMessages] = useState(conversation.messages || []);
  const [draft, setDraft] = useState('');
  const [queueError, setQueueError] = useState('');
  const [sending, setSending] = useState(false);
  const [showThemeControls, setShowThemeControls] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadQueuedMessages() {
      try {
        const queuedMessages = await offlineQueue.getAll();
        if (!active) {
          return;
        }

        const conversationMessages = queuedMessages.filter(
          item => item?.kind === 'chat-message' && item.conversationId === conversation.id,
        );
        setMessages(currentMessages => {
          const knownIds = new Set(currentMessages.map(message => message.id));
          return [
            ...currentMessages,
            ...conversationMessages.filter(message => !knownIds.has(message.id)),
          ];
        });
      } catch {
        if (active) {
          setQueueError('Could not load locally queued messages from this device.');
        }
      }
    }

    loadQueuedMessages();
    return () => {
      active = false;
    };
  }, [conversation.id]);

  async function sendMessage() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }

    const createdAt = new Date();
    const message = {
      id: `${conversation.id}-${createdAt.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      kind: 'chat-message',
      conversationId: conversation.id,
      sender: 'me',
      text,
      time: formatTime(createdAt),
      createdAt: createdAt.toISOString(),
      status: 'queued',
    };

    setSending(true);
    setQueueError('');
    try {
      await offlineQueue.enqueue(message);
      setMessages(currentMessages => [...currentMessages, message]);
      setDraft('');
    } catch {
      setQueueError('Message was not saved. Check device storage and try sending again.');
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={[styles.screen, { backgroundColor: theme.colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to chats"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backGlyph}>‹</Text>
          </Pressable>
          <VideoAvatar
            accessibilityLabel={`${conversation.name} looping avatar`}
            accentColor={
              conversation.online
                ? theme.colors.electricGreen
                : theme.colors.deepNeonPurple
            }
            initials={conversation.initials}
            isActive={conversation.online}
            neonIntensity={theme.effects.neonIntensity}
            size={40}
          />
          <View style={styles.headerIdentity}>
            <Text style={styles.name}>{conversation.name}</Text>
            <Text style={styles.handle}>
              {conversation.online ? 'ONLINE · PRIVATE CHANNEL' : 'PRIVATE CHANNEL · OFFLINE READY'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle appearance controls"
            accessibilityState={{ expanded: showThemeControls }}
            onPress={() => setShowThemeControls(current => !current)}
            style={[styles.themeToggle, showThemeControls && styles.themeToggleActive]}
          >
            <Text style={styles.themeToggleText}>Aa</Text>
          </Pressable>
          <View style={styles.lockBadge}>
            <Text style={styles.lockGlyph}>⌑</Text>
          </View>
        </View>

        <View style={styles.encryptionNotice}>
          <Text style={styles.encryptionText}>
            M7 PRIVATE CHANNEL · MESSAGES QUEUED LOCALLY UNTIL SYNC
          </Text>
        </View>

        {showThemeControls ? <ThemeControls /> : null}

        <ScrollView
          ref={scrollViewRef}
          style={{ backgroundColor: theme.colors.background }}
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.dayDivider}>TODAY · PRIVATE TRANSMISSION</Text>
          {messages.map(message => (
            <MessageBubble key={message.id} message={message} theme={theme} />
          ))}
        </ScrollView>

        {queueError ? (
          <Text accessibilityRole="alert" style={styles.errorMessage}>
            {queueError}
          </Text>
        ) : null}

        <View
          style={[
            styles.composer,
            {
              backgroundColor: theme.colors.surface,
              borderColor: `rgba(0, 255, 102, ${Math.max(0.15, theme.effects.neonIntensity * 0.45)})`,
            },
          ]}
        >
          <TextInput
            accessibilityLabel="Write a secure message"
            editable={!sending}
            multiline
            onChangeText={setDraft}
            onSubmitEditing={sendMessage}
            placeholder="Write a message..."
            placeholderTextColor={m7Theme.colors.mutedText}
            returnKeyType="send"
            style={styles.input}
            value={draft}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Queue message"
            disabled={!draft.trim() || sending}
            onPress={sendMessage}
            style={({ pressed }) => [
              styles.sendButton,
              (!draft.trim() || sending) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            <Text style={styles.sendGlyph}>{sending ? '…' : '↑'}</Text>
          </Pressable>
        </View>
        <Text style={styles.composerHint}>SAVED TO THIS DEVICE · SYNC SERVICE NOT CONNECTED</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: m7Theme.colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: m7Theme.colors.background,
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#292731',
  },
  backButton: {
    width: 38,
    height: 42,
    justifyContent: 'center',
  },
  backGlyph: {
    color: m7Theme.colors.electricGreen,
    fontSize: 34,
    lineHeight: 36,
  },
  headerIdentity: {
    flex: 1,
    marginLeft: 9,
    marginRight: 6,
  },
  name: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 14,
  },
  handle: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.8,
    marginTop: 3,
  },
  lockBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#21462E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeToggle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A3543',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 7,
  },
  themeToggleActive: {
    borderColor: m7Theme.colors.electricGreen,
    backgroundColor: '#00FF6618',
  },
  themeToggleText: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 12,
  },
  lockGlyph: {
    color: m7Theme.colors.electricGreen,
    fontSize: 17,
  },
  encryptionNotice: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#0C130F',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1C3223',
  },
  encryptionText: {
    color: '#9CC5A9',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  messagesContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 20,
    justifyContent: 'flex-end',
    gap: 12,
  },
  dayDivider: {
    alignSelf: 'center',
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1,
    marginBottom: 10,
  },
  messageRow: {
    width: '100%',
    flexDirection: 'row',
  },
  incomingRow: {
    justifyContent: 'flex-start',
  },
  outgoingRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 7,
  },
  incomingBubble: {
    backgroundColor: '#17151E',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#302D39',
  },
  outgoingBubble: {
    backgroundColor: m7Theme.colors.cyberYellow,
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: '#F1F0F4',
    fontFamily: m7Theme.fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  outgoingText: {
    color: '#17140A',
  },
  messageMeta: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  queuedLabel: {
    color: '#6E5B00',
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.3,
  },
  messageTime: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 9,
  },
  outgoingTime: {
    color: '#655A24',
  },
  errorMessage: {
    color: '#FF8B8B',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 11,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  composer: {
    marginHorizontal: 14,
    marginTop: 8,
    paddingLeft: 14,
    paddingRight: 6,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#32303A',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    paddingTop: 11,
    paddingBottom: 11,
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.body,
    fontSize: 13,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: m7Theme.colors.electricGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  sendButtonPressed: {
    opacity: 0.7,
  },
  sendGlyph: {
    color: m7Theme.colors.background,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 22,
    lineHeight: 26,
  },
  composerHint: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 7,
    letterSpacing: 1,
    textAlign: 'center',
    paddingTop: 7,
    paddingBottom: 6,
  },
});
