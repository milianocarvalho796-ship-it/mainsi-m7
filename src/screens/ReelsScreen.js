import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText as Text } from '../components/ThemedText';
import VideoAvatar from '../components/VideoAvatar';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';

const reels = [
  {
    id: 'reel-01',
    creator: '@zero.afterhours',
    title: 'THE LAST TRAIN',
    caption: 'Somewhere between the city and the signal.',
    likes: '12.8K',
    accent: m7Theme.colors.electricGreen,
    backdrop: '#08140F',
    artwork: 'NIGHT\nRUNNER',
    index: '01 / 03',
  },
  {
    id: 'reel-02',
    creator: '@pixel.ghost',
    title: 'GHOST IN THE GRID',
    caption: 'A new frequency just entered the district.',
    likes: '8.4K',
    accent: m7Theme.colors.cyberYellow,
    backdrop: '#171307',
    artwork: 'SIGNAL\nLOST',
    index: '02 / 03',
  },
  {
    id: 'reel-03',
    creator: '@neon.archive',
    title: 'PURPLE HOUR',
    caption: 'For the ones still awake when the world goes quiet.',
    likes: '21.1K',
    accent: m7Theme.colors.deepNeonPurple,
    backdrop: '#14091D',
    artwork: 'AFTER\nLIGHT',
    index: '03 / 03',
  },
];

function ReelCard({ reel, height, liked, onLike, theme }) {
  return (
    <View style={[styles.reel, { height }]}>
      <View style={[styles.artwork, { backgroundColor: reel.backdrop }]}>
        <View style={[styles.halo, { borderColor: `${reel.accent}88` }]} />
        <View style={[styles.haloInner, { borderColor: `${reel.accent}55` }]} />
        <View style={[styles.verticalBeam, { backgroundColor: `${reel.accent}33` }]} />
        <View style={[styles.horizontalBeam, { backgroundColor: `${reel.accent}66` }]} />
        <View style={styles.artworkHeader}>
          <Text style={[styles.artworkIndex, { color: reel.accent }]}>{reel.index}</Text>
          <Text style={styles.artworkLabel}>M7 ORIGINALS</Text>
        </View>
        <Text style={[styles.artworkTitle, { color: reel.accent }]}>{reel.artwork}</Text>
        <View style={[styles.playButton, { borderColor: reel.accent }]}>
          <Text style={[styles.playGlyph, { color: reel.accent }]}>▶</Text>
        </View>
        <View style={styles.bottomScrim} />
      </View>

      <View style={styles.reelTopBar}>
        <Text style={styles.reelsHeading}>M7 REELS</Text>
        <Text style={styles.scrollHint}>SCROLL TO EXPLORE ↓</Text>
      </View>

      <View style={styles.reelInfo}>
        <View style={styles.creatorRow}>
          <VideoAvatar
            accessibilityLabel={`${reel.creator} looping creator avatar`}
            accentColor={reel.accent}
            initials={reel.creator.slice(1, 3).toUpperCase()}
            neonIntensity={theme.effects.neonIntensity}
            wallpaperScope="reels"
            size={34}
          />
          <View style={[styles.creatorTag, { borderColor: `${reel.accent}88` }]}>
            <Text style={[styles.creatorText, { color: reel.accent }]}>{reel.creator}</Text>
          </View>
          <Text style={styles.originalBadge}>M7 ORIGINAL</Text>
        </View>
        <Text style={styles.reelTitle}>{reel.title}</Text>
        <Text style={styles.reelCaption}>{reel.caption}</Text>
        <Text style={styles.soundLine}>♫  M7 AUDIO · CYBERPUNK AMBIENT</Text>
      </View>

      <View style={styles.actionRail}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike reel' : 'Like reel'}
          accessibilityState={{ selected: liked }}
          onPress={onLike}
          style={styles.reelAction}
        >
          <View style={[styles.likeButton, liked && styles.likeButtonActive]}>
            <Text style={[styles.likeGlyph, liked && styles.likeGlyphActive]}>♥</Text>
          </View>
          <Text style={styles.railCount}>{reel.likes}</Text>
        </Pressable>
        <View style={styles.reelAction}>
          <View style={styles.railIcon}>
            <Text style={styles.railGlyph}>↗</Text>
          </View>
          <Text style={styles.railCount}>SHARE</Text>
        </View>
      </View>
    </View>
  );
}

export default function ReelsScreen() {
  const { theme } = useM7Theme('reels');
  const [pageHeight, setPageHeight] = useState(0);
  const [likedReels, setLikedReels] = useState({});

  function handleLayout(event) {
    const height = event.nativeEvent.layout.height;
    setPageHeight(current => (current === height ? current : height));
  }

  function toggleLike(id) {
    setLikedReels(current => ({ ...current, [id]: !current[id] }));
  }

  return (
    <View
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      onLayout={handleLayout}
    >
      {pageHeight > 0 && (
        <ScrollView
          pagingEnabled
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {reels.map(reel => (
            <ReelCard
              key={reel.id}
              reel={reel}
              height={pageHeight}
              theme={theme}
              liked={Boolean(likedReels[reel.id])}
              onLike={() => toggleLike(reel.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: m7Theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  reel: {
    overflow: 'hidden',
    backgroundColor: m7Theme.colors.background,
  },
  artwork: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 1,
    top: '18%',
    alignSelf: 'center',
  },
  haloInner: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    top: '24%',
    alignSelf: 'center',
  },
  verticalBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    alignSelf: 'center',
  },
  horizontalBeam: {
    position: 'absolute',
    top: '42%',
    left: 0,
    right: 0,
    height: 1,
  },
  artworkHeader: {
    position: 'absolute',
    top: 24,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  artworkIndex: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  artworkLabel: {
    color: '#B8B8C0',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  artworkTitle: {
    fontFamily: m7Theme.fonts.display,
    fontSize: 34,
    lineHeight: 39,
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#00000099',
    textShadowRadius: 16,
  },
  playButton: {
    position: 'absolute',
    top: '43%',
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    backgroundColor: '#07070B99',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playGlyph: {
    fontSize: 15,
    marginLeft: 3,
  },
  bottomScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#07070B22',
  },
  reelTopBar: {
    position: 'absolute',
    top: 18,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reelsHeading: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 16,
    letterSpacing: 1,
  },
  scrollHint: {
    color: '#C2C2C8',
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 8,
    letterSpacing: 1.1,
  },
  reelInfo: {
    position: 'absolute',
    left: 20,
    right: 82,
    bottom: 30,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  creatorTag: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#07070BCC',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  creatorText: {
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 11,
  },
  originalBadge: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 8,
    letterSpacing: 1,
  },
  reelTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    fontSize: 19,
    letterSpacing: 0.7,
  },
  reelCaption: {
    color: '#E0DFE5',
    fontFamily: m7Theme.fonts.body,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  soundLine: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 9,
    letterSpacing: 0.6,
    marginTop: 10,
  },
  actionRail: {
    position: 'absolute',
    right: 16,
    bottom: 38,
    alignItems: 'center',
    gap: 20,
  },
  reelAction: {
    alignItems: 'center',
    gap: 6,
  },
  likeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF66',
    backgroundColor: '#07070B88',
  },
  likeButtonActive: {
    borderColor: m7Theme.colors.cyberYellow,
    backgroundColor: '#FFE60022',
  },
  likeGlyph: {
    color: m7Theme.colors.text,
    fontSize: 22,
  },
  likeGlyphActive: {
    color: m7Theme.colors.cyberYellow,
  },
  railIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF66',
    backgroundColor: '#07070B88',
  },
  railGlyph: {
    color: m7Theme.colors.text,
    fontSize: 20,
  },
  railCount: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.6,
  },
});
