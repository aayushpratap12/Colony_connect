import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/error.middleware';
import { io } from '@/index';

const triggerSchema = z.object({
  latitude:  z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ─── POST /api/sos ────────────────────────────────────────────────────────────
export const triggerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { latitude, longitude } = triggerSchema.parse(req.body);
    const { userId, colonyId } = req.user!;

    const locationSql = latitude && longitude
      ? `ST_MakePoint(${longitude}, ${latitude})::geography`
      : 'NULL';

    const { rows } = await db.query(
      `INSERT INTO sos_alerts (colony_id, user_id, location)
       VALUES ($1, $2, ${locationSql})
       RETURNING id, status, created_at`,
      [colonyId, userId],
    );

    const { rows: userRows } = await db.query(
      'SELECT name, flat_number FROM users WHERE id = $1', [userId],
    );

    const alert = {
      id:         rows[0].id,
      userId,
      userName:   userRows[0].name,
      flatNumber: userRows[0].flat_number,
      latitude:   latitude ?? null,
      longitude:  longitude ?? null,
      status:     rows[0].status,
      createdAt:  rows[0].created_at,
    };

    // Broadcast to entire colony — guards and secretary must see it
    io.to(`colony:${colonyId}`).emit('sos:alert', alert);

    res.status(201).json({ success: true, data: alert });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── GET /api/sos ─────────────────────────────────────────────────────────────
export const listHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activeOnly = req.query.active !== 'false';
    const { colonyId } = req.user!;

    const { rows } = await db.query(
      `SELECT s.id, s.user_id, s.status, s.created_at, s.resolved_at,
              u.name AS user_name, u.flat_number,
              ST_Y(s.location::geometry) AS latitude,
              ST_X(s.location::geometry) AS longitude
       FROM sos_alerts s
       JOIN users u ON u.id = s.user_id
       WHERE s.colony_id = $1 ${activeOnly ? "AND s.status = 'active'" : ''}
       ORDER BY s.created_at DESC
       LIMIT 50`,
      [colonyId],
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        id:         r.id,
        userId:     r.user_id,
        userName:   r.user_name,
        flatNumber: r.flat_number,
        latitude:   r.latitude ? Number(r.latitude) : null,
        longitude:  r.longitude ? Number(r.longitude) : null,
        status:     r.status,
        createdAt:  r.created_at,
        resolvedAt: r.resolved_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/sos/:id/resolve ───────────────────────────────────────────────
export const resolveHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId } = req.user!;

    const { rows } = await db.query(
      `UPDATE sos_alerts
       SET status = 'resolved', resolved_at = NOW()
       WHERE id = $1 AND colony_id = $2 AND status = 'active'
       RETURNING id, resolved_at`,
      [id, colonyId],
    );

    if (rows.length === 0) throw new AppError(404, 'SOS alert not found or already resolved');

    io.to(`colony:${colonyId}`).emit('sos:resolved', { id, resolvedAt: rows[0].resolved_at });

    res.json({ success: true, data: { id, status: 'resolved', resolvedAt: rows[0].resolved_at } });
  } catch (err) {
    next(err);
  }
};
