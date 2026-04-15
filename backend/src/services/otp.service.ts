import { redis } from '@/config/redis';
import { env } from '@/config/env';
import twilio from 'twilio';

const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_KEY = (phone: string) => `otp:${phone}`;

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtp = async (phone: string): Promise<void> => {
  const otp = generateOtp();
  await redis.setex(OTP_KEY(phone), OTP_TTL_SECONDS, otp);

  if (env.IS_DEV) {
    // In dev — log OTP instead of sending SMS (save Twilio credits)
    console.log(`[OTP] ${phone} → ${otp}`);
    return;
  }

  const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    body: `Your Colony Connect OTP is ${otp}. Valid for 5 minutes. Do not share.`,
    from: env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

export const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
  const stored = await redis.get(OTP_KEY(phone));
  if (!stored || stored !== otp) return false;
  await redis.del(OTP_KEY(phone)); // single-use
  return true;
};
