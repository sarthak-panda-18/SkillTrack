import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || '5000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skilltrack',
  JWT_SECRET: process.env.JWT_SECRET || '',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || (process.env.SMTP_PASS?.startsWith('re_') ? process.env.SMTP_PASS : ''),
  SMTP_HOST: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.resend.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '465', 10),
  SMTP_USER: process.env.SMTP_USER || process.env.EMAIL_USER || 'resend',
  SMTP_PASS: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'SkillTrack AI <onboarding@resend.dev>',
  FRONTEND_URL: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000',
};

export function validateCoreEnv(): void {
  if (!env.JWT_SECRET) {
    console.error('❌ [FATAL CONFIG ERROR] JWT_SECRET environment variable is missing from backend/.env');
    throw new Error('FATAL CONFIG ERROR: JWT_SECRET is required.');
  }
}
