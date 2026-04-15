const DEV_API_URL = 'http://192.168.1.6:5000'; // Physical device → PC IP
const PROD_API_URL = 'https://your-railway-app.up.railway.app';

export const Config = {
  API_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,
  SOCKET_URL: __DEV__ ? DEV_API_URL : PROD_API_URL,
  API_TIMEOUT: 15000,
  SOCKET_RECONNECT_ATTEMPTS: 5,
  OTP_RESEND_SECONDS: 60,
  GEOFENCE_DEFAULT_RADIUS_METERS: 500,
  MMKV_ENCRYPTION_KEY: 'colony-connect-mmkv-key', // move to env later
  MAX_IMAGE_SIZE_MB: 5,
  PAGINATION_LIMIT: 20,
} as const;
