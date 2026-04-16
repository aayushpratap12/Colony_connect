import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/error.middleware';
import { io } from '@/index';

const createSchema = z.object({
  title:       z.string().min(3).max(200),
  description: z.string().min(5).max(2000),
  price:       z.number().min(0).max(9999999),
  category:    z.string().min(1).max(50),
  imageUrls:   z.array(z.string().url()).max(5).default([]),
});

const updateSchema = createSchema.partial();

const listQuerySchema = z.object({
  category: z.string().optional(),
  cursor:   z.string().optional(),
  limit:    z.coerce.number().int().min(1).max(50).default(20),
});

// ─── GET /api/marketplace ─────────────────────────────────────────────────────
export const listHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, cursor, limit } = listQuerySchema.parse(req.query);
    const { colonyId } = req.user!;

    const params: unknown[] = [colonyId, limit + 1];
    const conditions = ["m.colony_id = $1", "m.status = 'active'"];

    if (category) {
      params.push(category);
      conditions.push(`m.category = $${params.length}`);
    }
    if (cursor) {
      params.push(new Date(cursor));
      conditions.push(`m.created_at < $${params.length}`);
    }

    const { rows } = await db.query(
      `SELECT m.id, m.title, m.description, m.price, m.category,
              m.image_urls, m.status, m.created_at,
              m.seller_id, u.name AS seller_name, u.flat_number
       FROM marketplace_listings m
       JOIN users u ON u.id = m.seller_id
       WHERE ${conditions.join(' AND ')}
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
        listings: items.map((r) => ({
          id:          r.id,
          title:       r.title,
          description: r.description,
          price:       Number(r.price),
          category:    r.category,
          imageUrls:   r.image_urls,
          status:      r.status,
          createdAt:   r.created_at,
          sellerId:    r.seller_id,
          sellerName:  r.seller_name,
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

// ─── GET /api/marketplace/:id ─────────────────────────────────────────────────
export const getHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId } = req.user!;

    const { rows } = await db.query(
      `SELECT m.id, m.title, m.description, m.price, m.category,
              m.image_urls, m.status, m.created_at,
              m.seller_id, u.name AS seller_name, u.flat_number, u.avatar_url
       FROM marketplace_listings m
       JOIN users u ON u.id = m.seller_id
       WHERE m.id = $1 AND m.colony_id = $2`,
      [id, colonyId],
    );

    if (rows.length === 0) throw new AppError(404, 'Listing not found');

    const r = rows[0];
    res.json({
      success: true,
      data: {
        id:          r.id,
        title:       r.title,
        description: r.description,
        price:       Number(r.price),
        category:    r.category,
        imageUrls:   r.image_urls,
        status:      r.status,
        createdAt:   r.created_at,
        sellerId:    r.seller_id,
        sellerName:  r.seller_name,
        flatNumber:  r.flat_number,
        sellerAvatar: r.avatar_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/marketplace ────────────────────────────────────────────────────
export const createHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, price, category, imageUrls } = createSchema.parse(req.body);
    const { userId, colonyId } = req.user!;

    const { rows } = await db.query(
      `INSERT INTO marketplace_listings (colony_id, seller_id, title, description, price, category, image_urls)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, status, created_at`,
      [colonyId, userId, title, description, price, category, imageUrls],
    );

    const { rows: userRows } = await db.query(
      'SELECT name, flat_number FROM users WHERE id = $1', [userId],
    );

    const listing = {
      id:          rows[0].id,
      title,
      description,
      price,
      category,
      imageUrls,
      status:      rows[0].status,
      createdAt:   rows[0].created_at,
      sellerId:    userId,
      sellerName:  userRows[0].name,
      flatNumber:  userRows[0].flat_number,
    };

    io.to(`colony:${colonyId}`).emit('listing:new', listing);

    res.status(201).json({ success: true, data: listing });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── PATCH /api/marketplace/:id ───────────────────────────────────────────────
export const updateHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = updateSchema.parse(req.body);
    const { id } = req.params;
    const { userId, colonyId } = req.user!;

    // Only seller can update
    const { rows: existing } = await db.query(
      'SELECT id FROM marketplace_listings WHERE id = $1 AND colony_id = $2 AND seller_id = $3',
      [id, colonyId, userId],
    );
    if (existing.length === 0) throw new AppError(404, 'Listing not found or not yours');

    const fields: string[] = [];
    const params: unknown[] = [];

    if (updates.title !== undefined)       { params.push(updates.title);       fields.push(`title = $${params.length}`); }
    if (updates.description !== undefined) { params.push(updates.description); fields.push(`description = $${params.length}`); }
    if (updates.price !== undefined)       { params.push(updates.price);       fields.push(`price = $${params.length}`); }
    if (updates.category !== undefined)    { params.push(updates.category);    fields.push(`category = $${params.length}`); }
    if (updates.imageUrls !== undefined)   { params.push(updates.imageUrls);   fields.push(`image_urls = $${params.length}`); }

    if (fields.length === 0) throw new AppError(400, 'No fields to update');

    params.push(id, colonyId);
    const { rows } = await db.query(
      `UPDATE marketplace_listings SET ${fields.join(', ')} WHERE id = $${params.length - 1} AND colony_id = $${params.length} RETURNING *`,
      params,
    );

    io.to(`colony:${colonyId}`).emit('listing:updated', { id, ...updates });

    res.json({ success: true, data: { id, ...updates } });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── PATCH /api/marketplace/:id/status ───────────────────────────────────────
export const updateStatusHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = z.object({ status: z.enum(['active', 'sold', 'removed']) }).parse(req.body);
    const { id } = req.params;
    const { userId, colonyId, role } = req.user!;

    // Seller or secretary can update status
    const sellerFilter = role === 'secretary' ? '' : 'AND seller_id = $3';
    const params = role === 'secretary' ? [status, id, colonyId] : [status, id, colonyId, userId];

    const { rows } = await db.query(
      `UPDATE marketplace_listings SET status = $1 WHERE id = $2 AND colony_id = $3 ${sellerFilter} RETURNING id, status`,
      params,
    );

    if (rows.length === 0) throw new AppError(404, 'Listing not found');

    io.to(`colony:${colonyId}`).emit('listing:updated', { id, status });

    res.json({ success: true, data: { id, status } });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};
