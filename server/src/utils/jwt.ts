import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'change-this-development-secret';
export type TokenPayload = { id: string; role: 'SUPER' | 'EDITOR' | 'BOOKING' };
export const signToken = (payload: TokenPayload) => jwt.sign(payload, secret, { expiresIn: '8h' });
export const verifyToken = (token: string) => jwt.verify(token, secret) as TokenPayload;
