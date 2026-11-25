import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { VideoView, useVideoPlayer } from 'expo-video';
import m7Theme from '../theme/m7Theme';
import { useM7Theme } from '../theme/M7ThemeProvider';
import ThemedText from './ThemedText';

const MAX_LOOP_DURATION_MS = 10000;

const VideoAvatar = forwardRef(function VideoAvatar({
  initials = 'M7',
  size = 56,
  accentColor = m7Theme.colors.electricGreen,
  isActive = false,
  neonIntensity,
  accessibilityLabel,
  editable = false,
  media,
  onMediaChange,
  wallpaperScope,
}, ref) {
  const { theme } = useM7Theme(wallpaperScope);
  const animation = useRef(new Animated.Value(0)).current;
  const [localMedia, setLocalMedia] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerBusy, setPickerBusy] = useState(false);
  const intensity = neonIntensity ?? theme.effects.neonIntensity;
  const currentMedia = media === undefined ? localMedia : media;
  const videoSource = useMemo(
    () => (currentMedia?.type === 'video' ? { uri: currentMedia.uri } : null),
    [currentMedia?.type, currentMedia?.uri],
  );
  const player = useVideoPlayer(videoSource, videoPlayer => {
    videoPlayer.loop = true;
    videoPlayer.muted = true;
    videoPlayer.audioMixingMode = 'mixWithOthers';
  });

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animation]);

  useEffect(() => {
    if (currentMedia?.type === 'video') {
      player.muted = true;
      player.loop = true;
      player.play();
    } else {
      player.pause();
    }
  }, [currentMedia?.type, currentMedia?.uri, player]);

  function applyMedia(nextMedia) {
    if (onMediaChange) {
      return onMediaChange(nextMedia);
    }
    setLocalMedia(nextMedia);
    return undefined;
  }

  function openPicker() {
    if (editable) {
      setPickerVisible(true);
    }
  }

  useImperativeHandle(ref, () => ({
    openPicker,
    takePhoto: () => selectMedia('camera'),
  }));

  async function selectMedia(source) {
    setPickerVisible(false);
    setPickerBusy(true);

    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Camera permission needed',
            'Allow camera access in system settings to capture a profile photo.',
          );
          return;
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            'Media permission needed',
            'Allow photo library access to choose an avatar from this device.',
          );
          return;
        }

        const isVideo = source === 'video';
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: isVideo ? ['videos'] : ['images'],
          allowsEditing: !isVideo,
          ...(isVideo ? { videoMaxDuration: MAX_LOOP_DURATION_MS / 1000 } : { aspect: [1, 1] }),
          quality: 0.9,
        });
      }

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const type = asset.type === 'video' || source === 'video' ? 'video' : 'image';
      if (type === 'video' && asset.duration > MAX_LOOP_DURATION_MS) {
        Alert.alert(
          'Video is too long',
          'Choose a clip that is 10 seconds or shorter for a looping profile avatar.',
        );
        return;
      }

      await applyMedia({
        uri: asset.uri,
        type,
        duration: asset.duration ?? null,
        fileName: asset.fileName ?? null,
        mimeType: asset.mimeType ?? null,
      });
    } catch (error) {
      const detail = error instanceof Error ? ` ${error.message}` : '';
      Alert.alert('Avatar update failed', `The selected media could not be applied.${detail}`);
    } finally {
      setPickerBusy(false);
    }
  }

  async function removeMedia() {
    setPickerVisible(false);
    setPickerBusy(true);
    try {
      await applyMedia(null);
    } catch (error) {
      const detail = error instanceof Error ? ` ${error.message}` : '';
      Alert.alert('Avatar update failed', `The profile media could not be removed.${detail}`);
    } finally {
      setPickerBusy(false);
    }
  }

  const glowOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.08, 0.42 * intensity],
  });
  const scanOffset = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 0.28, size * 0.28],
  });
  const AvatarContent = (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            borderColor: accentColor,
            opacity: glowOpacity,
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.94, 1.12],
                }),
              },
            ],
          },
        ]}
      />
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: accentColor,
            padding: Math.max(2, size * 0.07),
            shadowColor: accentColor,
            shadowOpacity: 0.2 * intensity,
            shadowRadius: theme.effects.glowRadius,
          },
        ]}
      >
        <View
          style={[
            styles.core,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: size / 2,
            },
          ]}
        >
          {currentMedia?.type === 'image' ? (
            <Image
              accessibilityLabel={accessibilityLabel || `${initials} profile photo`}
              resizeMode="cover"
              source={{ uri: currentMedia.uri }}
              style={StyleSheet.absoluteFill}
            />
          ) : currentMedia?.type === 'video' ? (
            <VideoView
              allowsPictureInPicture={false}
              contentFit="cover"
              nativeControls={false}
              player={player}
              pointerEvents="none"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.scanLine,
                  {
                    backgroundColor: accentColor,
                    opacity: glowOpacity,
                    transform: [{ translateY: scanOffset }],
                  },
                ]}
              />
              <ThemedText style={[styles.initials, { fontSize: size * 0.25 }]}>
                {initials}
              </ThemedText>
            </>
          )}
          <View pointerEvents="none" style={[styles.innerRing, { borderColor: `${accentColor}55` }]} />
          {isActive && <View style={[styles.activeDot, { backgroundColor: m7Theme.colors.electricGreen }]} />}
        </View>
      </View>
      {editable && (
        <View pointerEvents="none" style={[styles.editBadge, { borderColor: theme.colors.background }]}>
          <ThemedText style={styles.editGlyph}>{pickerBusy ? '…' : '✎'}</ThemedText>
        </View>
      )}
      <Modal
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
        transparent
        visible={pickerVisible}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close avatar options"
            onPress={() => setPickerVisible(false)}
            style={styles.modalScrim}
          />
          <View style={[styles.pickerSheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.panelBorder }]}>
            <ThemedText style={styles.pickerTitle}>PROFILE MEDIA</ThemedText>
            <ThemedText style={styles.pickerDescription}>
              Photos are cropped to a circle. Video loops are muted and limited to 10 seconds.
            </ThemedText>
            <PickerAction label="TAKE PHOTO" icon="◎" onPress={() => selectMedia('camera')} />
            <PickerAction label="CHOOSE PHOTO" icon="▧" onPress={() => selectMedia('photo')} />
            <PickerAction label="CHOOSE VIDEO LOOP" icon="▷" onPress={() => selectMedia('video')} />
            {currentMedia ? (
              <PickerAction label="REMOVE PROFILE MEDIA" icon="×" onPress={removeMedia} />
            ) : null}
            <Pressable
              accessibilityRole="button"
              onPress={() => setPickerVisible(false)}
              style={styles.cancelAction}
            >
              <ThemedText style={styles.cancelText}>CANCEL</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel || `Avatar for ${initials}`}
      accessibilityRole={editable ? 'button' : 'image'}
      accessibilityHint={editable ? 'Opens profile photo and video options' : undefined}
      disabled={!editable || pickerBusy}
      onPress={openPicker}
      style={{ width: size, height: size }}
    >
      {AvatarContent}
    </Pressable>
  );
});

function PickerAction({ label, icon, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.pickerAction, pressed && styles.actionPressed]}
    >
      <ThemedText style={styles.pickerIcon}>{icon}</ThemedText>
      <ThemedText style={styles.pickerActionText}>{label}</ThemedText>
      <ThemedText style={styles.actionChevron}>›</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 999,
  },
  ring: {
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  core: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  innerRing: {
    ...StyleSheet.absoluteFillObject,
    margin: '18%',
    borderWidth: 1,
    borderRadius: 999,
  },
  initials: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.display,
    textAlign: 'center',
  },
  activeDot: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: m7Theme.colors.background,
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: m7Theme.colors.deepNeonPurple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editGlyph: {
    color: m7Theme.colors.text,
    fontSize: 10,
    lineHeight: 12,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerSheet: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  pickerTitle: {
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 1,
  },
  pickerDescription: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.body,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
    marginBottom: 12,
  },
  pickerAction: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#383540',
  },
  actionPressed: {
    opacity: 0.65,
  },
  pickerIcon: {
    width: 34,
    color: m7Theme.colors.electricGreen,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 18,
  },
  pickerActionText: {
    flex: 1,
    color: m7Theme.colors.text,
    fontFamily: m7Theme.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.6,
  },
  actionChevron: {
    color: m7Theme.colors.mutedText,
    fontSize: 21,
  },
  cancelAction: {
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 4,
  },
  cancelText: {
    color: m7Theme.colors.mutedText,
    fontFamily: m7Theme.fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 1,
  },
});

export default VideoAvatar;
