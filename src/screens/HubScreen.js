import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText as Text } from '../components/ThemedText';
import ThemeControls from '../components/ThemeControls';
import VideoAvatar from '../components/VideoAvatar';
import offlineQueue from '../storage/offlineQueue';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';

const stats = [
  { label: 'APP MODES', value: '04', accent: m7Theme.colors.electricGreen },
  { label: 'CHAT THREADS', value: '04', accent: m7Theme.colors.cyberYellow },
  { label: 'FEED SIGNALS', value: '03', accent: m7Theme.colors.deepNeonPurple },
  { label: 'REEL CHANNELS', value: '03', accent: m7Theme.colors.electricGreen },
];

const shortcuts = [
  { label: 'CHATS', hint: 'Private messages', route: 'Chats', glyph: '◈', color: m7Theme.colors.electricGreen },
  { label: 'FEED', hint: 'Signal stream', route: 'Feed', glyph: '⌁', color: m7Theme.colors.cyberYellow },
  { label: 'REELS', hint: 'Vertical media', route: 'Reels', glyph: '▷', color: m7Theme.colors.deepNeonPurple },
];

function SectionHeading({ title, trailing }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {trailing ? <Text style={styles.sectionTrailing}>{trailing}</Text> : null}
    </View>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function HubScreen({ navigation }) {
  const { theme } = useM7Theme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [queueMonitor, setQueueMonitor] = useState({
    status: 'checking',
    count: null,
    checkedAt: null,
  });

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function refreshQueueStatus() {
        setQueueMonitor(current => ({ ...current, status: 'checking' }));

        try {
          const items = await offlineQueue.getAll();
          if (active) {
            setQueueMonitor({
              status: 'ready',
              count: items.length,
              checkedAt: new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              }),
            });
          }
        } catch {
          if (active) {
            setQueueMonitor({
              status: 'error',
              count: null,
              checkedAt: new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
              }),
            });
          }
        }
      }

      refreshQueueStatus();
      return () => {
        active = false;
      };
    }, [refreshKey]),
  );

  const queueStatus = {
    checking: 'SCANNING LOCAL STORAGE',
    ready: queueMonitor.count > 0 ? 'MESSAGES AWAITING SYNC' : 'QUEUE CLEAR',
    error: 'STORAGE UNAVAILABLE',
  }[queueMonitor.status];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MAINSI / M7 CORE</Text>
            <Text style={styles.title}>The Hub</Text>
          </View>
          <View style={styles.coreBadge}>
            <View style={styles.coreDot} />
            <Text style={styles.coreBadgeText}>LOCAL CORE</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileTopLine}>
            <Text style={styles.profileEyebrow}>OPERATIVE IDENTITY</Text>
            <Text style={styles.profileSerial}>M7 · ID 0007</Text>
          </View>
          <View style={styles.profileBody}>
            <VideoAvatar
              accessibilityLabel="M7 operative looping profile avatar"
              accentColor={theme.colors.electricGreen}
              initials="M7"
              neonIntensity={theme.effects.neonIntensity}
              size={64}
            />
            <View style={styles.profileIdentity}>
              <Text style={styles.profileName}>M7 OPERATIVE</Text>
              <Text style={styles.profileHandle}>@mainsi_user</Text>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>NIGHT RUNNER · LEVEL 07</Text>
              </View>
            </View>
          </View>
          <View style={styles.profileFooter}>
            <Text style={styles.profileFooterText}>PROFILE STORED ON THIS DEVICE</Text>
            <View style={styles.idMark}>
              <View style={styles.idBarShort} />
              <View style={styles.idBarLong} />
              <View style={styles.idBarMedium} />
              <View style={styles.idBarShort} />
              <View style={styles.idBarLong} />
              <View style={styles.idBarMedium} />
              <View style={styles.idBarShort} />
            </View>
          </View>
        </View>

        <SectionHeading title="SYSTEM SNAPSHOT" trailing="LOCAL PREVIEW" />
        <View style={styles.statsGrid}>
          {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </View>

        <SectionHeading title="QUICK ACCESS" trailing="SWITCH MODES" />
        <View style={styles.shortcutList}>
          {shortcuts.map(shortcut => (
            <Pressable
              key={shortcut.route}
              accessibilityRole="button"
              accessibilityLabel={`Open ${shortcut.label}`}
              onPress={() => navigation.navigate(shortcut.route)}
              style={({ pressed }) => [styles.shortcut, pressed && styles.shortcutPressed]}
            >
              <View style={[styles.shortcutGlyphBox, { borderColor: `${shortcut.color}66` }]}>
                <Text style={[styles.shortcutGlyph, { color: shortcut.color }]}>
                  {shortcut.glyph}
                </Text>
              </View>
              <View style={styles.shortcutText}>
                <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
                <Text style={styles.shortcutHint}>{shortcut.hint}</Text>
              </View>
              <Text style={styles.shortcutArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeading title="PERSONALIZATION" trailing="LIVE PREVIEW" />
        <ThemeControls />

        <SectionHeading title="OFFLINE QUEUE" trailing="DEVICE STORAGE" />
        <View style={styles.queueCard}>
          <View style={styles.queueTopRow}>
            <View style={styles.queueIcon}>
              <Text style={styles.queueIconText}>⇄</Text>
            </View>
            <View style={styles.queueIdentity}>
              <Text style={styles.queueTitle}>MESSAGE OUTBOX</Text>
              <Text style={styles.queueStatus}>{queueStatus}</Text>
            </View>
            <Text style={styles.queueCount}>
              {queueMonitor.count === null ? '--' : String(queueMonitor.count).padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.queueDivider} />
          <View style={styles.queueBottomRow}>
            <View style={styles.queueDetails}>
              <View style={[styles.queueStatusDot, queueMonitor.status === 'ready' && styles.queueStatusReady, queueMonitor.status === 'error' && styles.queueStatusError]} />
              <Text style={styles.queueDetailText}>
                {queueMonitor.status === 'error'
                  ? 'Could not read the local message queue.'
                  : 'Queue data is stored locally. Sync service is not connected.'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Refresh offline queue status"
              onPress={() => setRefreshKey(current => current + 1)}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshText}>RECHECK</Text>
            </Pressable>
          </View>
          <Text style={styles.checkedAt}>
            LAST CHECK · {queueMonitor.checkedAt || 'PENDING'}
          </Text>
        </View>

        <Text style={styles.footer}>M7 CORE SYSTEMS · BUILDING IN THE DARK</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: m7Theme.colors.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
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
    fontSize: 24,
    marginTop: 4,
  },
  coreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#26332A',
    borderRadius: 16,
  },
  coreDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: m7Theme.colors.electricGreen,
  },
  coreBadgeText: {
    color: '#A8C6AF',
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  profileCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#403058',
    padding: 14,
    backgroundColor: '#100C17',
    overflow: 'hidden',
  },
  profileTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileEyebrow: {
    color: m7Theme.colors.deepNeonPurple,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
  },
  profileSerial: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  profileBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  profileIdentity: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 15,
    letterSpacing: 0.6,
  },
  profileHandle: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 11,
    marginTop: 3,
  },
  rankBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#21142F',
  },
  rankText: {
    color: '#D5B3F5',
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.6,
  },
  profileFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#33273F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileFooterText: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.6,
  },
  idMark: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 2,
  },
  idBarShort: {
    width: 2,
    backgroundColor: m7Theme.colors.electricGreen,
  },
  idBarLong: {
    width: 4,
    backgroundColor: '#D9D5E0',
  },
  idBarMedium: {
    width: 2,
    backgroundColor: m7Theme.colors.deepNeonPurple,
  },
  sectionHeading: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.3,
  },
  sectionTrailing: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.7,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  statCard: {
    width: '48%',
    minHeight: 84,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#292631',
    borderRadius: 10,
    backgroundColor: '#101016',
    overflow: 'hidden',
  },
  statAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  statValue: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 23,
  },
  statLabel: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.7,
    marginTop: 5,
  },
  shortcutList: {
    gap: 8,
  },
  shortcut: {
    minHeight: 60,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#292631',
    borderRadius: 10,
    backgroundColor: '#101016',
  },
  shortcutPressed: {
    opacity: 0.7,
  },
  shortcutGlyphBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17151E',
  },
  shortcutGlyph: {
    fontSize: 19,
  },
  shortcutText: {
    marginLeft: 11,
    flex: 1,
  },
  shortcutLabel: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  shortcutHint: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 10,
    marginTop: 3,
  },
  shortcutArrow: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 24,
    marginHorizontal: 5,
  },
  queueCard: {
    borderWidth: 1,
    borderColor: '#292631',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#101016',
  },
  queueTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#102419',
    borderWidth: 1,
    borderColor: '#245434',
  },
  queueIconText: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 20,
  },
  queueIdentity: {
    marginLeft: 10,
    flex: 1,
  },
  queueTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  queueStatus: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  queueCount: {
    color: m7Theme.colors.cyberYellow,
    fontFamily: m7Theme.fonts.display,
    fontSize: 23,
  },
  queueDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#302D37',
    marginVertical: 11,
  },
  queueBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  queueStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: m7Theme.colors.cyberYellow,
    marginRight: 7,
  },
  queueStatusReady: {
    backgroundColor: m7Theme.colors.electricGreen,
  },
  queueStatusError: {
    backgroundColor: '#FF6262',
  },
  queueDetailText: {
    flex: 1,
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 9,
    lineHeight: 14,
  },
  refreshButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3D3946',
    borderRadius: 5,
  },
  refreshText: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 0.6,
  },
  checkedAt: {
    color: '#696673',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 0.5,
    marginTop: 10,
  },
  footer: {
    color: '#57535F',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1,
    textAlign: 'center',
    paddingTop: 6,
  },
});
