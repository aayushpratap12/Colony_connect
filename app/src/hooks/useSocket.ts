import { useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket, getSocket } from '@services/socket';
import useAppSelector from './useAppSelector';

// Manages socket lifecycle tied to auth state
const useSocket = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      socketRef.current = initSocket(accessToken);
    } else {
      disconnectSocket();
      socketRef.current = null;
    }

    return () => {
      // Do NOT disconnect on unmount — socket is a singleton
      // Only disconnect on logout (handled above when isAuthenticated = false)
    };
  }, [isAuthenticated, accessToken]);

  const getSocketInstance = () => {
    try {
      return getSocket();
    } catch {
      return null;
    }
  };

  return { socket: getSocketInstance() };
};

export default useSocket;
