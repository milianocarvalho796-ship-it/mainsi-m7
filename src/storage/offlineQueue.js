import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_STORAGE_KEY = '@mainsi/m7/offline-queue';

let pendingOperation = Promise.resolve();

function runExclusive(operation) {
  const result = pendingOperation.then(operation);
  pendingOperation = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function readQueue() {
  const storedQueue = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
  if (storedQueue === null) {
    return [];
  }

  const queue = JSON.parse(storedQueue);
  if (!Array.isArray(queue)) {
    throw new Error(`Invalid offline queue data at ${QUEUE_STORAGE_KEY}`);
  }

  return queue;
}

async function writeQueue(queue) {
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

const offlineQueue = {
  enqueue(item) {
    if (item === undefined) {
      return Promise.reject(new TypeError('Offline queue items cannot be undefined'));
    }

    return runExclusive(async () => {
      const queue = await readQueue();
      queue.push(item);
      await writeQueue(queue);
      return item;
    });
  },

  getAll() {
    return runExclusive(readQueue);
  },

  dequeue() {
    return runExclusive(async () => {
      const queue = await readQueue();
      if (queue.length === 0) {
        return null;
      }

      const [item] = queue;
      await writeQueue(queue.slice(1));
      return item;
    });
  },

  clear() {
    return runExclusive(() => AsyncStorage.removeItem(QUEUE_STORAGE_KEY));
  },
};

export { QUEUE_STORAGE_KEY };
export default offlineQueue;
