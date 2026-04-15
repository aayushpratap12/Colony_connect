import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import useAppDispatch from './useAppDispatch';
import useAppSelector from './useAppSelector';
import { setOnlineStatus, setPendingActionsCount } from '@redux/slices/uiSlice';
import { getPendingCount } from '@services/offline/queue';

// Monitors connection and syncs pending offline actions when back online
const useNetInfo = () => {
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((state) => state.ui.isOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected ?? false;
      dispatch(setOnlineStatus(connected));
      dispatch(setPendingActionsCount(getPendingCount()));
    });

    return unsubscribe;
  }, [dispatch]);

  return { isOnline };
};

export default useNetInfo;
