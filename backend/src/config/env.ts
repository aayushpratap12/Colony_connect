import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
};

export const env = {
  PORT: parseInt(process.env.PORT ?? '5000', 10),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  IS_DEV: process.env.NODE_ENV !== 'production',

  DATABASE_URL: required('DATABASE_URL'),
  REDIS_URL: required('REDIS_URL'),

  JWT_ACCESS_SECRET: required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET: required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES ?? '15m',
  JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES ?? '30d',

  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID ?? '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN ?? '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER ?? '',

  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ?? '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL ?? '',

  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
} as const;
