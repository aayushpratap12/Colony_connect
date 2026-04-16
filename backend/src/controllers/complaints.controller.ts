import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/error.middleware';
import { io } from '@/index';

const createSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category:    z.enum(['maintenance', 'security', 'cleanliness', 'other']),
});

const statusSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
});

const listQuerySchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(50).default(20),
});

// ─── GET /api/complaints ──────────────────────────────────────────────────────
export const listHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, cursor, limit } = listQuerySchema.parse(req.query);
    const { colonyId, userId, role } = req.user!;

    // Residents only see their own; secretary/guard see all
    const isResident = role === 'resident';

    const params: unknown[] = [colonyId, limit + 1];
    const conditions: string[] = ['c.colony_id = $1'];
    if (isResident) {
      params.push(userId);
      conditions.push(`c.raised_by = $${params.length}`);
    }
    if (status) {
      params.push(status);
      conditions.push(`c.status = $${params.length}`);
    }
    if (cursor) {
      params.push(new Date(cursor));
      conditions.push(`c.created_at < $${params.length}`);
    }

    const where = conditions.join(' AND ');

    const { rows } = await db.query(
      `SELECT c.id, c.title, c.description, c.category, c.status,
              c.created_at, c.updated_at, c.raised_by,
              u.name AS raiser_name, u.flat_number
       FROM complaints c
       JOIN users u ON u.id = c.raised_by
       WHERE ${where}
       ORDER BY c.created_at DESC
       LIMIT $2`,
      params,
    );

    const hasMore    = rows.length > limit;
    const items      = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;

    res.json({
      success: true,
      data: {
        complaints: items.map((r) => ({
          id:          r.id,
          title:       r.title,
          description: r.description,
          category:    r.category,
          status:      r.status,
          createdAt:   r.created_at,
          updatedAt:   r.updated_at,
          raisedBy:    r.raised_by,
          raisedByName: r.raiser_name,
          flatNumber:  r.flat_number,
        })),
        nextCursor,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── POST /api/complaints ─────────────────────────────────────────────────────
export const createHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, category } = createSchema.parse(req.body);
    const { userId, colonyId } = req.user!;

    const { rows } = await db.query(
      `INSERT INTO complaints (colony_id, raised_by, title, description, category)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, status, created_at, updated_at`,
      [colonyId, userId, title, description, category],
    );

    const { rows: userRows } = await db.query(
      'SELECT name, flat_number FROM users WHERE id = $1', [userId],
    );

    const complaint = {
      id:          rows[0].id,
      title,
      description,
      category,
      status:      rows[0].status,
      createdAt:   rows[0].created_at,
      updatedAt:   rows[0].updated_at,
      raisedBy:    userId,
      raisedByName: userRows[0].name,
      flatNumber:  userRows[0].flat_number,
    };

    io.to(`colony:${colonyId}`).emit('complaint:new', complaint);

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── PATCH /api/complaints/:id/status ────────────────────────────────────────
export const updateStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = statusSchema.parse(req.body);
    const { id } = req.params;
    const { colonyId } = req.user!;

    const { rows } = await db.query(
      `UPDATE complaints
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND colony_id = $3
       RETURNING id, status, updated_at`,
      [status, id, colonyId],
    );

    if (rows.length === 0) throw new AppError(404, 'Complaint not found');

    io.to(`colony:${colonyId}`).emit('complaint:updated', { id, status, updatedAt: rows[0].updated_at });

    res.json({ success: true, data: { id, status, updatedAt: rows[0].updated_at } });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── GET /api/complaints/:id ──────────────────────────────────────────────────
export const getHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId, userId, role } = req.user!;

    const { rows } = await db.query(
      `SELECT c.id, c.title, c.description, c.category, c.status,
              c.created_at, c.updated_at, c.raised_by,
              u.name AS raiser_name, u.flat_number
       FROM complaints c
       JOIN users u ON u.id = c.raised_by
       WHERE c.id = $1 AND c.colony_id = $2
         ${role === 'resident' ? 'AND c.raised_by = $3' : ''}`,
      role === 'resident' ? [id, colonyId, userId] : [id, colonyId],
    );

    if (rows.length === 0) throw new AppError(404, 'Complaint not found');

    const r = rows[0];
    res.json({
      success: true,
      data: {
        id:          r.id,
        title:       r.title,
        description: r.description,
        category:    r.category,
        status:      r.status,
        createdAt:   r.created_at,
        updatedAt:   r.updated_at,
        raisedBy:    r.raised_by,
        raisedByName: r.raiser_name,
        flatNumber:  r.flat_number,
      },
    });
  } catch (err) {
    next(err);
  }
};
