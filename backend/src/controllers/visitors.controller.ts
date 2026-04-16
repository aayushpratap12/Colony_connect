import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '@/config/db';
import { AppError } from '@/middlewares/error.middleware';
import { io } from '@/index';

const createSchema = z.object({
  visitorName:   z.string().min(2).max(100),
  purpose:       z.string().min(3).max(200),
  vehicleNumber: z.string().max(20).optional(),
});

const verifyOtpSchema = z.object({
  otp:      z.string().length(6),
  colonyId: z.string().uuid(),
});

const OTP_TTL_MINUTES = 60 * 24; // 24 hours

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

// ─── POST /api/visitors ───────────────────────────────────────────────────────
export const createHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { visitorName, purpose, vehicleNumber } = createSchema.parse(req.body);
    const { userId, colonyId } = req.user!;

    const otp       = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    const { rows } = await db.query(
      `INSERT INTO visitors (colony_id, resident_id, visitor_name, purpose, otp, otp_expires_at, vehicle_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, status, created_at`,
      [colonyId, userId, visitorName, purpose, otp, expiresAt, vehicleNumber ?? null],
    );

    res.status(201).json({
      success: true,
      data: {
        id:            rows[0].id,
        visitorName,
        purpose,
        vehicleNumber: vehicleNumber ?? null,
        otp,
        otpExpiresAt:  expiresAt,
        status:        rows[0].status,
        createdAt:     rows[0].created_at,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    next(err);
  }
};

// ─── GET /api/visitors ────────────────────────────────────────────────────────
export const listHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit  = Math.min(Number(req.query.limit ?? 20), 50);
    const { colonyId, userId, role } = req.user!;

    const params: unknown[] = [colonyId, limit + 1];
    let whereExtra = '';

    if (role === 'resident') {
      params.push(userId);
      whereExtra += ` AND v.resident_id = $${params.length}`;
    }
    if (cursor) {
      params.push(new Date(cursor));
      whereExtra += ` AND v.created_at < $${params.length}`;
    }

    const { rows } = await db.query(
      `SELECT v.id, v.visitor_name, v.purpose, v.vehicle_number,
              v.otp, v.otp_expires_at, v.status,
              v.entry_time, v.exit_time, v.created_at,
              v.resident_id, u.name AS resident_name, u.flat_number
       FROM visitors v
       JOIN users u ON u.id = v.resident_id
       WHERE v.colony_id = $1 ${whereExtra}
       ORDER BY v.created_at DESC
       LIMIT $2`,
      params,
    );

    const hasMore    = rows.length > limit;
    const items      = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].created_at : null;

    res.json({
      success: true,
      data: {
        visitors: items.map((r) => ({
          id:            r.id,
          visitorName:   r.visitor_name,
          purpose:       r.purpose,
          vehicleNumber: r.vehicle_number,
          // Only show OTP to the resident who created it
          otp:           role === 'resident' ? r.otp : undefined,
          otpExpiresAt:  r.otp_expires_at,
          status:        r.status,
          entryTime:     r.entry_time,
          exitTime:      r.exit_time,
          createdAt:     r.created_at,
          residentId:    r.resident_id,
          residentName:  r.resident_name,
          flatNumber:    r.flat_number,
        })),
        nextCursor,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/visitors/verify/:otp ───────────────────────────────────────────
// Guard scans / enters OTP to get visitor info before allowing entry
export const verifyOtpHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { otp } = req.params;
    const { colonyId } = req.user!;

    const { rows } = await db.query(
      `SELECT v.id, v.visitor_name, v.purpose, v.vehicle_number,
              v.status, v.otp_expires_at,
              u.name AS resident_name, u.flat_number, u.id AS resident_id
       FROM visitors v
       JOIN users u ON u.id = v.resident_id
       WHERE v.otp = $1 AND v.colony_id = $2`,
      [otp, colonyId],
    );

    if (rows.length === 0) throw new AppError(404, 'Invalid OTP');

    const v = rows[0];

    if (v.status === 'expired' || new Date(v.otp_expires_at) < new Date()) {
      throw new AppError(400, 'OTP has expired');
    }
    if (v.status === 'exited') {
      throw new AppError(400, 'Visitor has already exited');
    }

    res.json({
      success: true,
      data: {
        id:            v.id,
        visitorName:   v.visitor_name,
        purpose:       v.purpose,
        vehicleNumber: v.vehicle_number,
        status:        v.status,
        residentName:  v.resident_name,
        flatNumber:    v.flat_number,
        residentId:    v.resident_id,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/visitors/:id/entry ───────────────────────────────────────────
export const markEntryHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId, userId } = req.user!;

    const { rows } = await db.query(
      `UPDATE visitors
       SET status = 'entered', entry_time = NOW(), guard_id = $3
       WHERE id = $1 AND colony_id = $2 AND status IN ('pending', 'approved')
       RETURNING id, visitor_name, resident_id, entry_time, status`,
      [id, colonyId, userId],
    );

    if (rows.length === 0) throw new AppError(404, 'Visitor pass not found or already processed');

    // Notify the resident
    io.to(`user:${rows[0].resident_id}`).emit('visitor:entry', {
      id:          rows[0].id,
      visitorName: rows[0].visitor_name,
      entryTime:   rows[0].entry_time,
    });

    res.json({ success: true, data: { id, status: rows[0].status, entryTime: rows[0].entry_time } });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/visitors/:id/exit ────────────────────────────────────────────
export const markExitHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId, userId } = req.user!;

    const { rows } = await db.query(
      `UPDATE visitors
       SET status = 'exited', exit_time = NOW(), guard_id = $3
       WHERE id = $1 AND colony_id = $2 AND status = 'entered'
       RETURNING id, visitor_name, resident_id, exit_time, status`,
      [id, colonyId, userId],
    );

    if (rows.length === 0) throw new AppError(404, 'Visitor not found or not yet entered');

    io.to(`user:${rows[0].resident_id}`).emit('visitor:exit', {
      id:          rows[0].id,
      visitorName: rows[0].visitor_name,
      exitTime:    rows[0].exit_time,
    });

    res.json({ success: true, data: { id, status: rows[0].status, exitTime: rows[0].exit_time } });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/visitors/:id/approve ─────────────────────────────────────────
export const approveHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { colonyId, userId } = req.user!;

    const { rows } = await db.query(
      `UPDATE visitors
       SET status = 'approved'
       WHERE id = $1 AND colony_id = $2 AND resident_id = $3 AND status = 'pending'
       RETURNING id, visitor_name, status`,
      [id, colonyId, userId],
    );

    if (rows.length === 0) throw new AppError(404, 'Visitor pass not found or already processed');

    io.to(`colony:${colonyId}:guards`).emit('visitor:approved', {
      id:          rows[0].id,
      visitorName: rows[0].visitor_name,
    });

    res.json({ success: true, data: { id, status: rows[0].status } });
  } catch (err) {
    next(err);
  }
};
