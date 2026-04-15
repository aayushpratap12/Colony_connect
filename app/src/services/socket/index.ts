import { io, Socket } from 'socket.io-client';
import { Config } from '@constants/config';
import { store } from '@redux/store';

// Singleton socket instance — one connection for the entire app lifecycle
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initSocket() first.');
  }
  return socket;
};

export const initSocket = (accessToken: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(Config.SOCKET_URL, {
    auth: { token: accessToken },
    transports: ['websocket'], // skip long-polling, go straight to ws
    reconnection: true,
    reconnectionAttempts: Config.SOCKET_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 10000,
  });

  socket.on('connect', () => {
    const { user } = store.getState().auth;
    if (user?.colonyId) {
      // Join colony room on every connect/reconnect
      socket!.emit('colony:join', { colonyId: user.colonyId });
    }
  });

  socket.on('connect_error', (err) => {
    if (__DEV__) console.warn('[Socket] connect_error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const isSocketConnected = (): boolean => socket?.connected ?? false;
