import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const experienceSchema = z.object({
  guestName: z.string().trim().min(2).max(120),
  guestEmail: z.string().trim().email().max(254),
  country: z.string().trim().min(2).max(100),
  verifiedVia: z.enum(['GOOGLE', 'TRIPADVISOR']),
  rating: z.coerce.number().int().min(1).max(5),
  story: z.string().trim().min(20).max(5_000),
});

const experienceWithMedia = { media: true } as const;

export async function listExperiences(_req: Request, res: Response) {
  res.json(await prisma.guestExperience.findMany({ include: experienceWithMedia, orderBy: { createdAt: 'desc' } }));
}

export async function listApprovedExperiences(_req: Request, res: Response) {
  res.json(await prisma.guestExperience.findMany({ where: { status: 'APPROVED' }, include: experienceWithMedia, orderBy: { createdAt: 'desc' } }));
}

export async function createExperience(req: Request, res: Response) {
  const result = experienceSchema.safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: 'Please complete the experience form correctly.' });

  const files = (req.files || []) as Express.Multer.File[];
  const experience = await prisma.guestExperience.create({
    data: {
      ...result.data,
      status: 'PENDING',
      media: files.length ? {
        create: files.map((file) => ({
          url: `/uploads/experiences/${file.filename}`,
          type: file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE',
        })),
      } : undefined,
    },
    include: experienceWithMedia,
  });

  res.status(201).json({ experience, message: 'Thank you. Your experience is awaiting review.' });
}

export async function updateExperienceStatus(req: Request, res: Response) {
  const result = z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']) }).safeParse(req.body);
  if (!result.success) return res.status(400).json({ message: 'Choose a valid status.' });
  try { res.json(await prisma.guestExperience.update({ where: { id: req.params.id }, data: result.data })); } catch { res.status(404).json({ message: 'Guest story not found.' }); }
}
