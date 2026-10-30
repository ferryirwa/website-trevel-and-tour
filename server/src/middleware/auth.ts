import { NextFunction, Request, Response } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';

declare global { namespace Express { interface Request { admin?: TokenPayload } } }

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication is required.' });
  try { req.admin = verifyToken(token); next(); } catch { return res.status(401).json({ message: 'Your session has expired. Please sign in again.' }); }
}
