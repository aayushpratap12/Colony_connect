import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/error.middleware';

const sendMessageSchema = z.object({
  content:  z.string().min(1).max(2000).optional(),
  type:     z.enum(['text', 'image', 'file']).default('text'),
  mediaUrl: z.string().url().optional(),
}).refine((d) => d.content || d.mediaUrl, { message: 'content or mediaUrl required' });

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(30),
});

// ─── GET /api/chat/rooms ──────────────────────────────────────────────────────
export const listRoomsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { colonyId } = req.user!;

    const { rows } = await db.query(
      `SELECT r.id, r.name, r.type, r.created_at,
              m.content AS last_message, m.created_at AS last_message_at,
              u.name AS last_sender_name
       FROM chat_rooms r
       LEFT JOIN LATERAL (
         SELECT content, created_at, sender_id
         FROM messages
         WHERE room_id = r.id
         ORDER BY created_at DESC
         LIMIT 1
       ) m ON true
       LEFT JOIN users u ON u.id = m.sender_id
       WHERE r.colony_id = $1
       ORDER BY COALESCE(m.created_at, r.created_at) DESC`,
      [colonyId],
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        id:             r.id,
        name:           r.name,
        type:           r.type,
        createdAt:      r.created_at,
        lastMessage:    r.last_message ?? null,
        lastMessageAt:  r.last_message_at ?? null,
        lastSenderName: r.last_sender_name ?? null,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/chat/rooms/:id/messages ─────────────────────────────────────────
export const listMessagesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cursor, limit } = listQuerySchema.parse(req.query);
    const { id } = req.params;
    const { colonyId } = req.user!;

    // Verify room belongs to colony
    const { rows: roomRows } = await db.query(
      'SELECT id FROM chat_rooms WHERE id = $1 AND colony_id = $2',
      [id, colonyId],
    );
    if (roomRows.length === 0) throw new AppError(404, 'Room not found');

    const params: unknown[] = [id, limit + 1];
    let cursorClause = '';
    if (cursor) {
      params.push(new Date(cursor));
      cursorClause = `AND m.created_at < $${params.length}`;
    }

    const { rows } = await db.query(
      `SELECT m.id, m.content, m.type, m.media_url, m.created_at,
              m.sender_id, u.name AS sender_name, u.avatar_url AS sender_avatar
       FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.room_id = $1 ${cursorClause}
       ORDER BY m.created_at DESC
       LIMIT $2`,
      params,
    );

    const hasMore    = rows.length > limit;
    const items      = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;

    res.json({
      success: true,
      data: {
        messages: items.reverse().map((r) => ({
          id:           r.id,
          content:      r.content,
          type:         r.type,
          mediaUrl:     r.media_url,
          createdAt:    r.created_at,
          senderId:     r.sender_id,
          senderName:   r.sender_name,
          senderAvatar: r.sender_avatar,
        })),
        nextCursor,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── POST /api/chat/rooms/:id/messages ────────────────────────────────────────
export const sendMessageHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, type, mediaUrl } = sendMessageSchema.parse(req.body);
    const { id } = req.params;
    const { userId, colonyId } = req.user!;

    // Verify room belongs to colony
    const { rows: roomRows } = await db.query(
      'SELECT id FROM chat_rooms WHERE id = $1 AND colony_id = $2',
      [id, colonyId],
    );
    if (roomRows.length === 0) throw new AppError(404, 'Room not found');

    const { rows } = await db.query(
      `INSERT INTO messages (room_id, colony_id, sender_id, content, type, media_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [id, colonyId, userId, content ?? null, type, mediaUrl ?? null],
    );

    const { rows: userRows } = await db.query(
      'SELECT name, avatar_url FROM users WHERE id = $1', [userId],
    );

    const message = {
      id:           rows[0].id,
      roomId:       id,
      content:      content ?? null,
      type,
      mediaUrl:     mediaUrl ?? null,
      createdAt:    rows[0].created_at,
      senderId:     userId,
      senderName:   userRows[0].name,
      senderAvatar: userRows[0].avatar_url,
    };

    // Also broadcast via socket
    const { io } = await import('@/index');
    io.to(`room:${id}`).emit('message:new', message);

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};
