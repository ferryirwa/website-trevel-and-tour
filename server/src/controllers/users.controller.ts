import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

export async function listAdminUsers(_req: Request, res: Response) {
  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  res.json(users);
}

const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254),
  password: z.string().min(6).max(100),
  role: z.enum(['SUPER', 'EDITOR', 'BOOKING']),
});

export async function createAdminUser(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid data. Password must be at least 6 characters.',
    });
  }

  const exists = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email },
  });
  if (exists) {
    return res.status(409).json({ message: 'Email already in use.' });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  res.status(201).json(user);
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.enum(['SUPER', 'EDITOR', 'BOOKING']).optional(),
  isActive: z.boolean().optional(),
});

export async function updateAdminUser(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid data.' });
  }

  try {
    const user = await prisma.adminUser.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch {
    res.status(404).json({ message: 'User not found.' });
  }
}

const passwordSchema = z.object({
  password: z.string().min(6).max(100),
});

export async function resetUserPassword(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters.',
    });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  try {
    await prisma.adminUser.update({
      where: { id },
      data: { passwordHash },
    });
    res.json({ success: true });
  } catch {
    res.status(404).json({ message: 'User not found.' });
  }
}

export async function deleteAdminUser(req: Request, res: Response) {
  const { id } = req.params;

  const me = (req as any).user;
  if (me?.id === id) {
    return res.status(400).json({ message: 'You cannot delete yourself.' });
  }

  const target = await prisma.adminUser.findUnique({ where: { id } });
  if (!target) {
    return res.status(404).json({ message: 'User not found.' });
  }
  if (target.role === 'SUPER') {
    const superCount = await prisma.adminUser.count({
      where: { role: 'SUPER' },
    });
    if (superCount <= 1) {
      return res.status(400).json({
        message: 'Cannot delete the last super admin.',
      });
    }
  }

  await prisma.adminUser.delete({ where: { id } });
  res.json({ success: true });
}
