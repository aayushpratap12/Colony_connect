import type { Request, Response, NextFunction } from 'express';
import { db } from '@/config/db';

// ─── GET /api/residents ───────────────────────────────────────────────────────
export const listHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { colonyId } = req.user!;
    const role = (req.query.role as string) ?? undefined;

    const params: unknown[] = [colonyId];
    let roleFilter = '';
    if (role) {
      params.push(role);
      roleFilter = `AND role = $${params.length}`;
    }

    const { rows } = await db.query(
      `SELECT id, name, phone, flat_number, role, avatar_url, is_verified, created_at
       FROM users
       WHERE colony_id = $1 ${roleFilter}
       ORDER BY flat_number ASC, name ASC`,
      params,
    );

    res.json({
      success: true,
      data: rows.map((r) => ({
        id:          r.id,
        name:        r.name,
        phone:       r.phone,
        flatNumber:  r.flat_number,
        role:        r.role,
        avatarUrl:   r.avatar_url,
        isVerified:  r.is_verified,
        createdAt:   r.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};
