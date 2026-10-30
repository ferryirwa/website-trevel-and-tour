import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { signToken } from '../utils/jwt.js';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Enter a valid email address and password.' });
  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return res.status(401).json({ message: 'Incorrect email or password.' });
  const token = signToken({ id: user.id, role: user.role });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } });
}
