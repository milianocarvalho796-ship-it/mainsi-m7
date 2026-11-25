import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

const PROFILE_MEDIA_KEY = '@mainsi/m7/profile-media';
const PROFILE_MEDIA_DIRECTORY = new Directory(Paths.document, 'profile-media');

async function loadProfileMedia() {
  const storedMedia = await AsyncStorage.getItem(PROFILE_MEDIA_KEY);
  if (storedMedia === null) {
    return null;
  }

  const media = JSON.parse(storedMedia);
  if (
    !media ||
    typeof media.uri !== 'string' ||
    !['image', 'video'].includes(media.type)
  ) {
    throw new Error('Saved profile media metadata is invalid');
  }

  if (!new File(media.uri).exists) {
    throw new Error('Saved profile media file is missing from this device');
  }

  return media;
}

function getFileExtension(asset, type) {
  const candidate = asset.fileName || asset.uri;
  const match = candidate.match(/\.([a-zA-Z0-9]{2,5})(?:[?#].*)?$/);
  if (match) {
    return match[1].toLowerCase();
  }

  return type === 'video' ? 'mp4' : 'jpg';
}

function deleteOwnedMediaFile(uri) {
  if (typeof uri !== 'string' || !uri.startsWith(PROFILE_MEDIA_DIRECTORY.uri)) {
    return;
  }

  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

async function saveProfileMedia(asset) {
  if (!asset || typeof asset.uri !== 'string' || !['image', 'video'].includes(asset.type)) {
    throw new TypeError('Profile media must include a local image or video URI');
  }

  const previousMediaJSON = await AsyncStorage.getItem(PROFILE_MEDIA_KEY);
  const previousMedia = previousMediaJSON === null ? null : JSON.parse(previousMediaJSON);
  PROFILE_MEDIA_DIRECTORY.create({ idempotent: true, intermediates: true });

  const extension = getFileExtension(asset, asset.type);
  const destination = new File(
    PROFILE_MEDIA_DIRECTORY,
    `avatar-${Date.now()}.${extension}`,
  );
  await new File(asset.uri).copy(destination);

  const savedMedia = {
    uri: destination.uri,
    type: asset.type,
    duration: Number.isFinite(asset.duration) ? asset.duration : null,
  };

  try {
    await AsyncStorage.setItem(PROFILE_MEDIA_KEY, JSON.stringify(savedMedia));
  } catch (error) {
    destination.delete();
    throw error;
  }

  deleteOwnedMediaFile(previousMedia?.uri);

  return savedMedia;
}

async function clearProfileMedia() {
  const storedMedia = await AsyncStorage.getItem(PROFILE_MEDIA_KEY);
  await AsyncStorage.removeItem(PROFILE_MEDIA_KEY);

  if (storedMedia !== null) {
    const media = JSON.parse(storedMedia);
    deleteOwnedMediaFile(media?.uri);
  }
}

export {
  PROFILE_MEDIA_KEY,
  clearProfileMedia,
  loadProfileMedia,
  saveProfileMedia,
};
