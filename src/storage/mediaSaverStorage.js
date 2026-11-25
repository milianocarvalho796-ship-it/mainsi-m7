import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';

const MEDIA_LIBRARY_KEY = '@mence/m7/media-library';
const MEDIA_DIRECTORY = new Directory(Paths.document, 'mence-media');
const AUDIO_EXTENSIONS = new Set(['aac', 'flac', 'm4a', 'mp3', 'ogg', 'wav']);
const VIDEO_EXTENSIONS = new Set(['m4v', 'mov', 'mp4', 'webm']);
const IMAGE_EXTENSIONS = new Set(['avif', 'gif', 'jpeg', 'jpg', 'png', 'webp']);

let pendingWrite = Promise.resolve();

function getMediaKind(filename, mimeType = '') {
  const extension = filename.match(/\.([a-z0-9]{2,5})(?:[?#].*)?$/i)?.[1]?.toLowerCase();
  if (mimeType.startsWith('audio/') || AUDIO_EXTENSIONS.has(extension)) {
    return 'audio';
  }
  if (mimeType.startsWith('video/') || VIDEO_EXTENSIONS.has(extension)) {
    return 'video';
  }
  if (mimeType.startsWith('image/') || IMAGE_EXTENSIONS.has(extension)) {
    return 'story';
  }
  return null;
}

function assertCategoryMatches(kind, category) {
  const valid = category === 'story'
    ? kind === 'story' || kind === 'video'
    : kind === category;
  if (!valid) {
    throw new Error(`Choose a ${category === 'audio' ? 'audio track' : category === 'video' ? 'video' : 'photo or video story'} file.`);
  }
}

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getExtension(filename, fallbackKind) {
  const extension = filename.match(/\.([a-z0-9]{2,5})(?:[?#].*)?$/i)?.[1]?.toLowerCase();
  if (extension) {
    return extension;
  }
  return fallbackKind === 'audio' ? 'mp3' : fallbackKind === 'story' ? 'jpg' : 'mp4';
}

function saveItem(item, destination) {
  const operation = pendingWrite.then(async () => {
    const existing = await loadSavedMedia();
    await AsyncStorage.setItem(MEDIA_LIBRARY_KEY, JSON.stringify([item, ...existing]));
  });
  pendingWrite = operation.then(() => undefined, () => undefined);
  return operation.catch(error => {
    if (destination.exists) {
      destination.delete();
    }
    throw error;
  });
}

async function loadSavedMedia() {
  const storedItems = await AsyncStorage.getItem(MEDIA_LIBRARY_KEY);
  if (storedItems === null) {
    return [];
  }

  const items = JSON.parse(storedItems);
  if (!Array.isArray(items)) {
    throw new Error('Saved media library data is invalid');
  }

  return items.map(item => {
    if (
      !item ||
      typeof item.id !== 'string' ||
      typeof item.uri !== 'string' ||
      typeof item.title !== 'string' ||
      !['audio', 'video', 'story'].includes(item.type)
    ) {
      throw new Error('Saved media entry is invalid');
    }
    return { ...item, missing: !new File(item.uri).exists };
  });
}

async function saveLocalMedia(sourceFile, category, title = '') {
  const kind = getMediaKind(sourceFile.name || sourceFile.uri, sourceFile.mimeType || '');
  if (!kind) {
    throw new Error('Select an audio, video, or image file.');
  }
  assertCategoryMatches(kind, category);

  MEDIA_DIRECTORY.create({ idempotent: true, intermediates: true });
  const id = createId();
  const extension = getExtension(sourceFile.name || sourceFile.uri, kind);
  const destination = new File(MEDIA_DIRECTORY, `${id}.${extension}`);
  try {
    await sourceFile.copy(destination);
  } catch (error) {
    if (destination.exists) {
      destination.delete();
    }
    throw error;
  }

  const item = {
    id,
    title: title.trim() || sourceFile.name || 'Saved media',
    type: category,
    uri: destination.uri,
    createdAt: new Date().toISOString(),
  };
  await saveItem(item, destination);
  return item;
}

async function saveDirectMediaLink(rawUrl, category, title = '') {
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new Error('Enter a valid direct HTTPS media-file link.');
  }

  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error('Only public HTTPS links to direct media files are supported.');
  }

  const kind = getMediaKind(url.pathname);
  if (!kind) {
    throw new Error('The link must end in a supported audio, video, or image file extension.');
  }
  assertCategoryMatches(kind, category);

  MEDIA_DIRECTORY.create({ idempotent: true, intermediates: true });
  const id = createId();
  const extension = getExtension(url.pathname, kind);
  const destination = new File(MEDIA_DIRECTORY, `${id}.${extension}`);
  try {
    await File.downloadFileAsync(url.toString(), destination);
  } catch (error) {
    if (destination.exists) {
      destination.delete();
    }
    throw error;
  }

  const item = {
    id,
    title: title.trim() || url.pathname.split('/').pop() || 'Saved media',
    type: category,
    uri: destination.uri,
    createdAt: new Date().toISOString(),
  };
  await saveItem(item, destination);
  return item;
}

async function removeSavedMedia(id) {
  const operation = pendingWrite.then(async () => {
    const existing = await loadSavedMedia();
    const target = existing.find(item => item.id === id);
    if (!target) {
      throw new Error('Saved media item was not found.');
    }
    await AsyncStorage.setItem(
      MEDIA_LIBRARY_KEY,
      JSON.stringify(existing.filter(item => item.id !== id)),
    );
    if (target.uri.startsWith(MEDIA_DIRECTORY.uri)) {
      const file = new File(target.uri);
      if (file.exists) {
        file.delete();
      }
    }
  });
  pendingWrite = operation.then(() => undefined, () => undefined);
  return operation;
}

export {
  MEDIA_LIBRARY_KEY,
  loadSavedMedia,
  removeSavedMedia,
  saveDirectMediaLink,
  saveLocalMedia,
};
