import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
}

const getSecret = (): string => {
  if (!env.JWT_SECRET) {
    throw new Error('FATAL CONFIG ERROR: JWT_SECRET environment variable is missing.');
  }
  return env.JWT_SECRET;
};

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, getSecret(), {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, getSecret()) as JwtPayload;
};
