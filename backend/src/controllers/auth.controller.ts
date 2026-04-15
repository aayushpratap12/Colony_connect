import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/config/db';
import { redis } from '@/config/redis';
import { AppError } from '@/middlewares/error.middleware';
import { sendOtp, verifyOtp } from '@/services/otp.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';

// ─── Validation schemas ───────────────────────────────────────────────────────
const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian mobile number'),
});

const verifyOtpSchema = z.object({
  phone: z.string(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const registerSchema = z.object({
  phone: z.string(),
  colonyId: z.string().uuid(),
  name: z.string().min(2).max(60),
  flatNumber: z.string().min(1).max(20),
  fcmToken: z.string().optional(),
});

const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 30; // 30 days
const refreshKey = (token: string) => `refresh:${token}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const buildTokens = async (userId: string, colonyId: string, role: string) => {
  const payload = { userId, colonyId, role: role as any };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await redis.setex(refreshKey(refreshToken), REFRESH_TOKEN_TTL, userId);
  return { accessToken, refreshToken };
};

// ─── Controllers ──────────────────────────────────────────────────────────────
export const sendOtpHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = sendOtpSchema.parse(req.body);
    await sendOtp(phone);
    res.json({ success: true, data: { message: 'OTP sent', expiresIn: 300 } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    }
    next(err);
  }
};

export const verifyOtpHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, otp } = verifyOtpSchema.parse(req.body);

    const valid = await verifyOtp(phone, otp);
    if (!valid) throw new AppError(400, 'Invalid or expired OTP');

    // Check if user exists
    const { rows } = await db.query(
      'SELECT id, colony_id, role, name, flat_number, fcm_token, avatar_url, is_verified FROM users WHERE phone = $1',
      [phone],
    );

    if (rows.length === 0) {
      // New user — don't issue tokens yet
      return res.json({ success: true, data: { isNewUser: true } });
    }

    const user = rows[0];
    const { accessToken, refreshToken } = await buildTokens(user.id, user.colony_id, user.role);

    res.json({
      success: true,
      data: {
        isNewUser: false,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          colonyId: user.colony_id,
          role: user.role,
          name: user.name,
          flatNumber: user.flat_number,
          fcmToken: user.fcm_token,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
          phone,
        },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    }
    next(err);
  }
};

export const registerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, colonyId, name, flatNumber, fcmToken } = registerSchema.parse(req.body);

    // Verify colony exists
    const { rows: colonyRows } = await db.query(
      'SELECT id FROM colonies WHERE id = $1',
      [colonyId],
    );
    if (colonyRows.length === 0) throw new AppError(404, 'Colony not found');

    // Check duplicate
    const { rows: existing } = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
    if (existing.length > 0) throw new AppError(409, 'Phone number already registered');

    const userId = uuidv4();
    const { rows } = await db.query(
      `INSERT INTO users (id, colony_id, phone, name, flat_number, role, fcm_token, is_verified, created_at)
       VALUES ($1, $2, $3, $4, $5, 'resident', $6, false, NOW())
       RETURNING id, colony_id, role, name, flat_number, fcm_token, avatar_url, is_verified`,
      [userId, colonyId, phone, name, flatNumber, fcmToken ?? null],
    );

    const user = rows[0];
    const { accessToken, refreshToken } = await buildTokens(user.id, user.colony_id, user.role);

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          colonyId: user.colony_id,
          role: user.role,
          name: user.name,
          flatNumber: user.flat_number,
          fcmToken: user.fcm_token,
          avatarUrl: user.avatar_url,
          isVerified: user.is_verified,
          phone,
        },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return next(new AppError(400, 'Validation error', err.flatten().fieldErrors as any));
    }
    next(err);
  }
};

export const refreshHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError(400, 'Refresh token required');

    // Check Redis — if deleted (logout), reject
    const stored = await redis.get(refreshKey(refreshToken));
    if (!stored) throw new AppError(401, 'Refresh token expired or revoked');

    const payload = verifyRefreshToken(refreshToken);
    const { accessToken, refreshToken: newRefresh } = await buildTokens(
      payload.userId,
      payload.colonyId,
      payload.role,
    );
    // Rotate — delete old refresh token
    await redis.del(refreshKey(refreshToken));

    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch (err) {
    next(err);
  }
};

export const logoutHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await redis.del(refreshKey(refreshToken));
    res.json({ success: true, data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
};

export const getColoniesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng } = req.query;

    let rows;
    if (lat && lng) {
      // Return colonies sorted by distance using PostGIS
      ({ rows } = await db.query(
        `SELECT id, name, address, total_units,
          ST_Distance(location::geography, ST_MakePoint($2, $1)::geography) AS distance_meters
         FROM colonies
         ORDER BY distance_meters ASC
         LIMIT 20`,
        [lat, lng],
      ));
    } else {
      ({ rows } = await db.query(
        'SELECT id, name, address, total_units FROM colonies ORDER BY name ASC LIMIT 50',
      ));
    }

    res.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        address: r.address,
        totalUnits: r.total_units,
        distanceMeters: r.distance_meters ? Math.round(r.distance_meters) : undefined,
      })),
    });
  } catch (err) {
    next(err);
  }
};
