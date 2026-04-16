import { useEffect } from 'react';
import { initSocket, disconnectSocket } from '@services/socket';
import useAppSelector from './useAppSelector';
import useAppDispatch from './useAppDispatch';
import { baseApi } from '@redux/api/baseApi';
import { chatApi } from '@redux/api/chatApi';
import type { Message, SosAlert, Complaint, Visitor } from '@typings/models.types';

const useSocket = () => {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      disconnectSocket();
      return;
    }

    const socket = initSocket(accessToken);

    // ─── Announcements ────────────────────────────────────────────────────────
    socket.on('announcement:new', () => {
      dispatch(baseApi.util.invalidateTags(['Announcements']));
    });
    socket.on('announcement:pinned', () => {
      dispatch(baseApi.util.invalidateTags(['Announcements']));
    });

    // ─── Complaints ───────────────────────────────────────────────────────────
    socket.on('complaint:new', () => {
      dispatch(baseApi.util.invalidateTags(['Complaints']));
    });
    socket.on('complaint:updated', (_payload: Pick<Complaint, 'id' | 'status'>) => {
      dispatch(baseApi.util.invalidateTags(['Complaints']));
    });

    // ─── Visitors ─────────────────────────────────────────────────────────────
    socket.on('visitor:approved', () => {
      dispatch(baseApi.util.invalidateTags(['Visitors']));
    });
    socket.on('visitor:entry', (_payload: Pick<Visitor, 'id' | 'visitorName'>) => {
      dispatch(baseApi.util.invalidateTags(['Visitors']));
    });
    socket.on('visitor:exit', () => {
      dispatch(baseApi.util.invalidateTags(['Visitors']));
    });

    // ─── Events ───────────────────────────────────────────────────────────────
    socket.on('event:new', () => {
      dispatch(baseApi.util.invalidateTags(['Events']));
    });
    socket.on('event:rsvp_updated', () => {
      dispatch(baseApi.util.invalidateTags(['Events']));
    });

    // ─── Marketplace ──────────────────────────────────────────────────────────
    socket.on('listing:new', () => {
      dispatch(baseApi.util.invalidateTags(['Marketplace']));
    });
    socket.on('listing:updated', () => {
      dispatch(baseApi.util.invalidateTags(['Marketplace']));
    });

    // ─── SOS ──────────────────────────────────────────────────────────────────
    socket.on('sos:alert', (_alert: SosAlert) => {
      dispatch(baseApi.util.invalidateTags(['Residents']));
    });
    socket.on('sos:resolved', () => {
      dispatch(baseApi.util.invalidateTags(['Residents']));
    });

    // ─── Chat — append message directly to cache (no round-trip needed) ───────
    socket.on('message:new', (message: Message) => {
      dispatch(
        chatApi.util.updateQueryData('getMessages', { roomId: message.roomId }, (draft) => {
          const alreadyExists = draft.messages.some((m) => m.id === message.id);
          if (!alreadyExists) draft.messages.push(message);
        }),
      );
      dispatch(baseApi.util.invalidateTags(['ChatRooms']));
    });

    return () => {
      socket.off('announcement:new');
      socket.off('announcement:pinned');
      socket.off('complaint:new');
      socket.off('complaint:updated');
      socket.off('visitor:approved');
      socket.off('visitor:entry');
      socket.off('visitor:exit');
      socket.off('event:new');
      socket.off('event:rsvp_updated');
      socket.off('listing:new');
      socket.off('listing:updated');
      socket.off('sos:alert');
      socket.off('sos:resolved');
      socket.off('message:new');
    };
  }, [isAuthenticated, accessToken, dispatch]);
};

export default useSocket;
