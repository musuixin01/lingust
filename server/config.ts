import dotenv from 'dotenv';

dotenv.config();

export const SERVER_CONFIG = {
  PORT: 3000,
  HOST: '0.0.0.0',
  BODY_LIMIT: '25mb',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
};

export const GEMINI_CONFIG = {
  RECOMMENDED_MODELS: [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
  ],
  COOLDOWN_SECONDS: 60,
};
