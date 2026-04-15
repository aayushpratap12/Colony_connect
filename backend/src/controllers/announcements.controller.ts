import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/error.middleware';

// ─── Validation schemas ───────────────────────────────────────────────────────
const createSchema = z.object({
  title: z.string().min(3).max(200),
  body:  z.string().min(5).max(2000),
});

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
});

// ─── GET /api/announcements ───────────────────────────────────────────────────
export const listHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cursor, limit } = listQuerySchema.parse(req.query);
    const { colonyId } = req.user!;

    const { rows } = await db.query<{
      id: string; title: string; body: string; is_pinned: boolean;
      created_at: string; created_by: string; creator_name: string;
    }>(
      `SELECT
         a.id, a.title, a.body, a.is_pinned, a.created_at,
         a.created_by, u.name AS creator_name
       FROM announcements a
       JOIN users u ON u.id = a.created_by
       WHERE a.colony_id = $1
         ${cursor ? 'AND a.created_at < $3' : ''}
       ORDER BY a.is_pinned DESC, a.created_at DESC
       LIMIT $2`,
      cursor ? [colonyId, limit + 1, new Date(cursor)] : [colonyId, limit + 1],
    );

    const hasMore  = rows.length > limit;
    const items    = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;

    res.json({
      success: true,
      data: {
        announcements: items.map((r) => ({
          id:            r.id,
          colonyId,
          title:         r.title,
          body:          r.body,
          isPinned:      r.is_pinned,
          createdAt:     r.created_at,
          createdBy:     r.created_by,
          createdByName: r.creator_name,
        })),
        nextCursor,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    }
    next(err);
  }
};

// ─── POST /api/announcements ──────────────────────────────────────────────────
export const createHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, body } = createSchema.parse(req.body);
    const { userId, colonyId } = req.user!;

    const { rows } = await db.query<{ id: string; created_at: string }>(
      `INSERT INTO announcements (colony_id, created_by, title, body)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [colonyId, userId, title, body],
    );

    const { rows: userRows } = await db.query<{ name: string }>(
      'SELECT name FROM users WHERE id = $1', [userId],
    );

    res.status(201).json({
      success: true,
      data: {
        id:            rows[0].id,
        colonyId,
        title,
        body,
        isPinned:      false,
        createdAt:     rows[0].created_at,
        createdBy:     userId,
        createdByName: userRows[0].name,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    }
    next(err);
  }
};

// ─── PATCH /api/announcements/:id/pin ────────────────────────────────────────
export const togglePinHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId } = req.user!;

    const { rows } = await db.query<{ is_pinned: boolean }>(
      `UPDATE announcements
       SET is_pinned = NOT is_pinned
       WHERE id = $1 AND colony_id = $2
       RETURNING is_pinned`,
      [id, colonyId],
    );

    if (rows.length === 0) throw new AppError(404, 'Announcement not found');

    res.json({ success: true, data: { isPinned: rows[0].is_pinned } });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/announcements/:id ───────────────────────────────────────────
export const deleteHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId } = req.user!;

    const { rowCount } = await db.query(
      'DELETE FROM announcements WHERE id = $1 AND colony_id = $2',
      [id, colonyId],
    );

    if (!rowCount) throw new AppError(404, 'Announcement not found');

    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
};
