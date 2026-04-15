import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import type { AuthPayload } from '@/middlewares/auth.middleware';

export const signAccessToken = (payload: AuthPayload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES });

export const signRefreshToken = (payload: AuthPayload) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES });

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as AuthPayload;
};
