import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/error.middleware';
import { io } from '@/index';

const createSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  venue:       z.string().min(2).max(200),
  eventDate:   z.string().datetime(),
});

const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
  upcoming: z.coerce.boolean().default(true),
});

// ─── GET /api/events ──────────────────────────────────────────────────────────
export const listHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { cursor, limit, upcoming } = listQuerySchema.parse(req.query);
    const { colonyId, userId } = req.user!;

    const params: unknown[] = [colonyId, limit + 1];
    const conditions = ['e.colony_id = $1'];

    if (upcoming) {
      conditions.push('e.event_date >= NOW()');
    }
    if (cursor) {
      params.push(new Date(cursor));
      conditions.push(`e.event_date ${upcoming ? '>' : '<'} $${params.length}`);
    }

    const where = conditions.join(' AND ');
    const order = upcoming ? 'ASC' : 'DESC';

    const { rows } = await db.query(
      `SELECT e.id, e.title, e.description, e.venue, e.event_date, e.created_at,
              e.created_by, u.name AS creator_name,
              COUNT(r.user_id) AS rsvp_count,
              BOOL_OR(r.user_id = $3) AS user_rsvped
       FROM events e
       JOIN users u ON u.id = e.created_by
       LEFT JOIN event_rsvps r ON r.event_id = e.id
       WHERE ${where}
       GROUP BY e.id, u.name
       ORDER BY e.event_date ${order}
       LIMIT $2`,
      [...params, userId],
    );

    const hasMore    = rows.length > limit;
    const items      = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].event_date : null;

    res.json({
      success: true,
      data: {
        events: items.map((r) => ({
          id:          r.id,
          title:       r.title,
          description: r.description,
          venue:       r.venue,
          eventDate:   r.event_date,
          createdAt:   r.created_at,
          createdBy:   r.created_by,
          createdByName: r.creator_name,
          rsvpCount:   Number(r.rsvp_count),
          userRsvped:  r.user_rsvped ?? false,
        })),
        nextCursor,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── GET /api/events/:id ──────────────────────────────────────────────────────
export const getHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId, userId } = req.user!;

    const { rows } = await db.query(
      `SELECT e.id, e.title, e.description, e.venue, e.event_date, e.created_at,
              e.created_by, u.name AS creator_name,
              COUNT(r.user_id) AS rsvp_count,
              BOOL_OR(r.user_id = $3) AS user_rsvped
       FROM events e
       JOIN users u ON u.id = e.created_by
       LEFT JOIN event_rsvps r ON r.event_id = e.id
       WHERE e.id = $1 AND e.colony_id = $2
       GROUP BY e.id, u.name`,
      [id, colonyId, userId],
    );

    if (rows.length === 0) throw new AppError(404, 'Event not found');

    const r = rows[0];
    res.json({
      success: true,
      data: {
        id:          r.id,
        title:       r.title,
        description: r.description,
        venue:       r.venue,
        eventDate:   r.event_date,
        createdAt:   r.created_at,
        createdBy:   r.created_by,
        createdByName: r.creator_name,
        rsvpCount:   Number(r.rsvp_count),
        userRsvped:  r.user_rsvped ?? false,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/events ─────────────────────────────────────────────────────────
export const createHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, venue, eventDate } = createSchema.parse(req.body);
    const { userId, colonyId } = req.user!;

    const { rows } = await db.query(
      `INSERT INTO events (colony_id, created_by, title, description, venue, event_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [colonyId, userId, title, description, venue, new Date(eventDate)],
    );

    const { rows: userRows } = await db.query('SELECT name FROM users WHERE id = $1', [userId]);

    const event = {
      id:          rows[0].id,
      title,
      description,
      venue,
      eventDate,
      createdAt:   rows[0].created_at,
      createdBy:   userId,
      createdByName: userRows[0].name,
      rsvpCount:   0,
      userRsvped:  false,
    };

    io.to(`colony:${colonyId}`).emit('event:new', event);

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── POST /api/events/:id/rsvp ────────────────────────────────────────────────
export const toggleRsvpHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId, colonyId } = req.user!;

    // Check event belongs to colony
    const { rows: eventRows } = await db.query(
      'SELECT id FROM events WHERE id = $1 AND colony_id = $2',
      [id, colonyId],
    );
    if (eventRows.length === 0) throw new AppError(404, 'Event not found');

    // Toggle RSVP
    const { rows: existing } = await db.query(
      'SELECT 1 FROM event_rsvps WHERE event_id = $1 AND user_id = $2',
      [id, userId],
    );

    let rsvped: boolean;
    if (existing.length > 0) {
      await db.query('DELETE FROM event_rsvps WHERE event_id = $1 AND user_id = $2', [id, userId]);
      rsvped = false;
    } else {
      await db.query('INSERT INTO event_rsvps (event_id, user_id) VALUES ($1, $2)', [id, userId]);
      rsvped = true;
    }

    const { rows: countRows } = await db.query(
      'SELECT COUNT(*) AS cnt FROM event_rsvps WHERE event_id = $1', [id],
    );

    const rsvpCount = Number(countRows[0].cnt);
    io.to(`colony:${colonyId}`).emit('event:rsvp_updated', { id, rsvpCount });

    res.json({ success: true, data: { rsvped, rsvpCount } });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────
export const deleteHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId } = req.user!;

    const { rowCount } = await db.query(
      'DELETE FROM events WHERE id = $1 AND colony_id = $2',
      [id, colonyId],
    );

    if (!rowCount) throw new AppError(404, 'Event not found');

    res.json({ success: true, data: { message: 'Deleted' } });
  } catch (err) {
    next(err);
  }
};
