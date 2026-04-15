import { storage } from '@services/storage/mmkv';

interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
  retries: number;
}

const QUEUE_KEY = 'offline_action_queue';
const MAX_RETRIES = 3;

const getQueue = (): OfflineAction[] => {
  const raw = storage.getString(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveQueue = (queue: OfflineAction[]) => {
  storage.set(QUEUE_KEY, JSON.stringify(queue));
};

export const enqueueAction = (type: string, payload: unknown) => {
  const queue = getQueue();
  queue.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
  });
  saveQueue(queue);
};

export const getPendingActions = (): OfflineAction[] => getQueue();

export const removeAction = (id: string) => {
  const queue = getQueue().filter((a) => a.id !== id);
  saveQueue(queue);
};

export const incrementRetry = (id: string) => {
  const queue = getQueue().map((a) => (a.id === id ? { ...a, retries: a.retries + 1 } : a));
  // Remove if exceeded max retries
  const filtered = queue.filter((a) => a.retries <= MAX_RETRIES);
  saveQueue(filtered);
};

export const clearQueue = () => storage.delete(QUEUE_KEY);

export const getPendingCount = (): number => getQueue().length;
