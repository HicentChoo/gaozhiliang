import jwt, { type SignOptions, type Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
// Ensure expiresIn matches jsonwebtoken type expectations (number | StringValue)
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export interface JWTPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * 生成JWT Token
 */
export function generateToken(payload: JWTPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * 验证JWT Token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * 加密密码
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/**
 * 验证密码
 */
export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
