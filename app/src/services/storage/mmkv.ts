import { MMKV } from 'react-native-mmkv';
import { Config } from '@constants/config';

export const storage = new MMKV({
  id: 'colony-connect-storage',
  encryptionKey: Config.MMKV_ENCRYPTION_KEY,
});

// Redux Persist compatible storage adapter
export const mmkvStorageAdapter = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string) => {
    storage.delete(key);
    return Promise.resolve();
  },
};
