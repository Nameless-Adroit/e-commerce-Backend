import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthTokenPayload } from '../types/index.js';

export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
}
