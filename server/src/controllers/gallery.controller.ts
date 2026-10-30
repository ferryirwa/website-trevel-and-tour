import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

export async function listGallery(_req: Request, res: Response) {
  const gallery = await prisma.gallery.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(gallery);
}
const gallerySchema = z.object({ category: z.enum(['NATURE', 'ACTIVITY', 'FACILITY', 'VIDEO']), caption: z.string().trim().max(240).optional() });
export async function createGallery(req: Request, res: Response) { const parsed = gallerySchema.safeParse(req.body); const files = (req.files || []) as Express.Multer.File[]; if (!parsed.success || !files.length) return res.status(400).json({ message: 'Choose a category and at least one media file.' }); const items = await prisma.$transaction(files.map((file) => prisma.gallery.create({ data: { ...parsed.data, url: `/uploads/gallery/${file.filename}`, type: file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE', category: file.mimetype.startsWith('video/') ? 'VIDEO' : parsed.data.category } }))); res.status(201).json(items); }
export async function deleteGallery(req: Request, res: Response) { try { await prisma.gallery.delete({ where: { id: req.params.id } }); res.status(204).end(); } catch { res.status(404).json({ message: 'Gallery item not found.' }); } }
