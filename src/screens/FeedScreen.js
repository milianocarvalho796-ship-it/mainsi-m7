import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText as Text } from '../components/ThemedText';
import VideoAvatar from '../components/VideoAvatar';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';

const microPosts = [
  {
    id: 'signal-01',
    initials: 'NV',
    handle: '@nova.exe',
    time: '2m',
    text: 'City lights hit different when the whole grid is yours. Stay electric. ⚡',
    likes: 128,
    replies: 14,
  },
  {
    id: 'signal-02',
    initials: 'K7',
    handle: '@kairo_7',
    time: '18m',
    text: 'Reminder from the underground: protect your peace like it is encrypted.',
    likes: 86,
    replies: 9,
  },
];

function Avatar({ initials, variant = 'green', size = 38 }) {
  const { theme } = useM7Theme('feed');
  return (
    <VideoAvatar
      initials={initials}
      accentColor={variant === 'purple' ? theme.colors.deepNeonPurple : theme.colors.electricGreen}
      neonIntensity={theme.effects.neonIntensity}
      wallpaperScope="feed"
      size={size}
    />
  );
}

function LikeButton({ liked, count, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike post' : 'Like post'}
      accessibilityState={{ selected: liked }}
      onPress={onPress}
      style={styles.action}
    >
      <Text style={[styles.actionIcon, liked && styles.likedIcon]}>{liked ? '♥' : '♡'}</Text>
      <Text style={[styles.actionCount, liked && styles.likedText]}>
        {count + (liked ? 1 : 0)}
      </Text>
    </Pressable>
  );
}

function MicroPost({ post, liked, onLike, theme }) {
  return (
    <View style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
      <View style={styles.postHeader}>
        <Avatar initials={post.initials} />
        <View style={styles.identity}>
          <Text style={styles.handle}>{post.handle}</Text>
          <Text style={styles.timestamp}>{post.time} ago · SIGNAL</Text>
        </View>
        <Text style={styles.more}>···</Text>
      </View>
      <Text style={styles.postText}>{post.text}</Text>
      <View style={styles.postFooter}>
        <LikeButton liked={liked} count={post.likes} onPress={onLike} />
        <View style={styles.action}>
          <Text style={styles.actionIcon}>↩</Text>
          <Text style={styles.actionCount}>{post.replies}</Text>
        </View>
        <Text style={styles.signalTag}>#CYBERNOTES</Text>
      </View>
    </View>
  );
}

function FeaturedPost({ liked, onLike, theme }) {
  return (
    <View style={[styles.featuredCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
      <View style={styles.featuredHeader}>
        <Avatar initials="NX" variant="purple" />
        <View style={styles.identity}>
          <Text style={styles.handle}>@neon.archive</Text>
          <Text style={styles.timestamp}>Yesterday · NIGHT TRANSMISSION</Text>
        </View>
        <Text style={styles.more}>···</Text>
      </View>

      <View style={[styles.featuredMedia, { backgroundColor: theme.colors.background }]}>
        <View style={styles.mediaOrbit} />
        <View style={styles.mediaRing} />
        <View style={styles.mediaHorizon} />
        <View style={styles.mediaCopy}>
          <Text style={styles.mediaKicker}>M7 CITY STUDIES / 008</Text>
          <Text style={styles.mediaTitle}>AFTER{'\n'}DARK</Text>
          <Text style={styles.mediaCaption}>NEON DISTRICT · 02:41 AM</Text>
        </View>
        <View style={styles.mediaPlay}>
          <Text style={styles.playGlyph}>▶</Text>
        </View>
      </View>

      <Text style={styles.featuredText}>
        Last train, first light. A little transmission from the edge of the city.
      </Text>
      <View style={styles.featuredFooter}>
        <LikeButton liked={liked} count={342} onPress={onLike} />
        <View style={styles.action}>
          <Text style={styles.actionIcon}>↩</Text>
          <Text style={styles.actionCount}>28</Text>
        </View>
        <Text style={styles.mediaTag}>MEDIA · 0:18</Text>
      </View>
    </View>
  );
}

export default function FeedScreen() {
  const { theme } = useM7Theme('feed');
  const [likedPosts, setLikedPosts] = useState({});
  const [activeStream, setActiveStream] = useState('x');

  function toggleLike(id) {
    setLikedPosts(current => ({ ...current, [id]: !current[id] }));
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.colors.electricGreen }]}>Mence. / @voce.mence</Text>
          <Text style={styles.screenTitle}>Feed</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.feedTabs}>
        {[
          { id: 'x', label: 'X STREAM' },
          { id: 'facebook', label: 'FACEBOOK' },
        ].map(stream => (
          <Pressable
            key={stream.id}
            accessibilityRole="button"
            accessibilityState={{ selected: activeStream === stream.id }}
            onPress={() => setActiveStream(stream.id)}
            style={[
              styles.feedTab,
              activeStream === stream.id && {
                borderBottomColor: theme.colors.electricGreen,
              },
            ]}
          >
            <Text
              style={[
                activeStream === stream.id ? styles.activeFeedTabText : styles.inactiveFeedTab,
                activeStream === stream.id && { color: theme.colors.electricGreen },
              ]}
            >
              {stream.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        {activeStream === 'x' ? (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.electricGreen }]}>
              X-STYLE MICRO NOTES <Text style={styles.sectionCount}>/ {microPosts.length}</Text>
            </Text>
            {microPosts.map(post => (
              <MicroPost
                key={post.id}
                post={post}
                theme={theme}
                liked={Boolean(likedPosts[post.id])}
                onLike={() => toggleLike(post.id)}
              />
            ))}
          </>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: theme.colors.electricGreen }]}>
              FACEBOOK-STYLE MEDIA STREAM
            </Text>
            <FeaturedPost
              liked={Boolean(likedPosts.featured)}
              onLike={() => toggleLike('featured')}
              theme={theme}
            />
            <View style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
              <View style={styles.postHeader}>
                <Avatar initials="K7" size={38} />
                <View style={styles.identity}>
                  <Text style={styles.handle}>@kairo_7</Text>
                  <Text style={styles.timestamp}>2 hours ago · COMMUNITY</Text>
                </View>
              </View>
              <Text style={styles.featuredText}>
                Night market finds. New routes, old friends, and a skyline that never sleeps.
              </Text>
              <View style={styles.communityMedia}>
                <Text style={styles.mediaKicker}>COMMUNITY ALBUM / 04</Text>
                <Text style={styles.mediaTitle}>NIGHT{'\n'}MARKET</Text>
              </View>
              <LikeButton
                liked={Boolean(likedPosts.community)}
                count={96}
                onPress={() => toggleLike('community')}
              />
            </View>
          </>
        )}
        <Text style={styles.endOfFeed}>YOU'RE CAUGHT UP · STAY ELECTRIC</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: m7Theme.colors.background,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 2,
  },
  screenTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 23,
    marginTop: 4,
  },
  liveBadge: {
    borderWidth: 1,
    borderColor: '#244631',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: m7Theme.colors.electricGreen,
  },
  liveText: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
  },
  feedTabs: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#27242E',
    paddingHorizontal: 20,
    gap: 26,
  },
  feedTab: {
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeFeedTabText: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1,
  },
  inactiveFeedTab: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 1,
    paddingBottom: 12,
  },
  communityMedia: {
    height: 150,
    marginVertical: 12,
    padding: 18,
    borderRadius: 10,
    backgroundColor: '#160D22',
    justifyContent: 'center',
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14,
  },
  sectionLabel: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  sectionCount: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    letterSpacing: 0,
  },
  postCard: {
    backgroundColor: '#101016',
    borderWidth: 1,
    borderColor: '#24232C',
    borderRadius: 14,
    padding: 14,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identity: {
    marginLeft: 10,
    flex: 1,
  },
  handle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 13,
  },
  timestamp: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 10,
    marginTop: 2,
  },
  more: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 20,
    lineHeight: 20,
  },
  postText: {
    color: '#E8E8EC',
    fontFamily: m7Theme.fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
  },
  postFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 17,
  },
  likedIcon: {
    color: m7Theme.colors.electricGreen,
  },
  actionCount: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 11,
  },
  likedText: {
    color: m7Theme.colors.electricGreen,
  },
  signalTag: {
    marginLeft: 'auto',
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  featuredCard: {
    backgroundColor: '#101016',
    borderWidth: 1,
    borderColor: '#24232C',
    borderRadius: 14,
    padding: 14,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featuredMedia: {
    height: 220,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#160D22',
    justifyContent: 'center',
  },
  mediaOrbit: {
    position: 'absolute',
    width: 208,
    height: 208,
    borderRadius: 104,
    right: -14,
    top: -34,
    backgroundColor: '#9D00FF22',
    borderWidth: 1,
    borderColor: '#9D00FF77',
  },
  mediaRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: 15,
    top: -5,
    borderWidth: 1,
    borderColor: '#00FF6677',
  },
  mediaHorizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 34,
    height: 1,
    backgroundColor: '#00FF6688',
  },
  mediaCopy: {
    paddingHorizontal: 20,
    zIndex: 1,
  },
  mediaKicker: {
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  mediaTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 32,
    lineHeight: 34,
    marginTop: 10,
  },
  mediaCaption: {
    color: '#C8BBD3',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1,
    marginTop: 8,
  },
  mediaPlay: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: m7Theme.colors.electricGreen,
    backgroundColor: '#07070BCC',
  },
  playGlyph: {
    color: m7Theme.colors.electricGreen,
    fontSize: 11,
    marginLeft: 2,
  },
  featuredText: {
    color: '#E8E8EC',
    fontFamily: m7Theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    marginTop: 12,
  },
  mediaTag: {
    marginLeft: 'auto',
    color: m7Theme.colors.deepNeonPurple,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  endOfFeed: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: 'center',
    paddingVertical: 18,
  },
});
