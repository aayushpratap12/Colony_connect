import type { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import type { AuthPayload } from '@/middlewares/auth.middleware';
import { db } from '@/config/db';

// Extend socket data type — Socket.io 4.x typed socket data
declare module 'socket.io' {
  interface SocketData {
    user: AuthPayload;
  }
}

export const registerSocketHandlers = (io: SocketServer) => {
  // ─── Auth middleware (runs before connection) ────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) return next(new Error('No token provided'));

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, colonyId, role } = socket.data.user;

    // ─── Auto-join rooms on connect ────────────────────────────────────────────
    // Every user joins their colony room (for broadcasts)
    socket.join(`colony:${colonyId}`);
    // Personal room for direct notifications
    socket.join(`user:${userId}`);
    // Guards join a separate room so residents can notify them
    if (role === 'guard') {
      socket.join(`colony:${colonyId}:guards`);
    }

    // ─── Join specific chat room ───────────────────────────────────────────────
    socket.on('room:join', (roomId: string) => {
      // Verify user's colony owns this room before joining
      db.query('SELECT id FROM chat_rooms WHERE id = $1 AND colony_id = $2', [roomId, colonyId])
        .then(({ rows }) => {
          if (rows.length > 0) {
            socket.join(`room:${roomId}`);
          }
        })
        .catch(() => {/* ignore */});
    });

    // ─── Leave chat room ───────────────────────────────────────────────────────
    socket.on('room:leave', (roomId: string) => {
      socket.leave(`room:${roomId}`);
    });

    // ─── Typing indicators ─────────────────────────────────────────────────────
    socket.on('user:typing', (roomId: string) => {
      socket.to(`room:${roomId}`).emit('user:typing', { userId, roomId });
    });

    socket.on('user:typing_stop', (roomId: string) => {
      socket.to(`room:${roomId}`).emit('user:typing_stop', { userId, roomId });
    });

    // ─── Disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      // Socket.io auto-cleans rooms on disconnect
      console.log(`[Socket] ${userId} disconnected: ${reason}`);
    });
  });
};
