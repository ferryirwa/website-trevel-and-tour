import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';

const packageInclude = { type: true, location: true, media: true, itineraries: { orderBy: { sortOrder: 'asc' as const } }, includes: true, excludes: true };

export async function listPackages(_req: Request, res: Response) {
  const packages = await prisma.package.findMany({ where: { status: 'ACTIVE' }, include: packageInclude, orderBy: { createdAt: 'desc' } });
  res.json(packages);
}

export async function getPackageBySlug(req: Request, res: Response) {
  const pkg = await prisma.package.findFirst({ where: { slug: req.params.slug, status: 'ACTIVE' }, include: packageInclude });
  if (!pkg) return res.status(404).json({ message: 'Tour not found' });
  res.json(pkg);
}

const packageSchema = z.object({ typeId: z.string().min(1), locationId: z.string().min(1), nameEn: z.string().trim().min(2), nameId: z.string().trim().min(2).optional(), slug: z.string().trim().regex(/^[a-z0-9-]+$/), descriptionEn: z.string().trim().min(10), descriptionId: z.string().trim().optional(), durationHours: z.coerce.number().int().min(1), price: z.coerce.number().positive(), maxGuests: z.coerce.number().int().min(1), status: z.enum(['DRAFT', 'ACTIVE']).default('DRAFT') });
export async function listAdminPackages(_req: Request, res: Response) { res.json(await prisma.package.findMany({ include: packageInclude, orderBy: { createdAt: 'desc' } })); }
export async function createPackage(req: Request, res: Response) {
  const parsed = packageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Please check the package fields.', errors: parsed.error.flatten() });
  try { const data = parsed.data; const files = (req.files || []) as Express.Multer.File[]; res.status(201).json(await prisma.package.create({ data: { ...data, nameId: data.nameId || data.nameEn, descriptionId: data.descriptionId || data.descriptionEn, media: files.length ? { create: files.map((file) => ({ url: `/uploads/packages/${file.filename}`, type: 'IMAGE' })) } : undefined }, include: packageInclude })); } catch { res.status(409).json({ message: 'A package with this slug already exists.' }); }
}
export async function updatePackage(req: Request, res: Response) {
  const parsed = packageSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Please check the package fields.' });
  try { const files = (req.files || []) as Express.Multer.File[]; res.json(await prisma.package.update({ where: { id: req.params.id }, data: { ...parsed.data, media: files.length ? { create: files.map((file) => ({ url: `/uploads/packages/${file.filename}`, type: 'IMAGE' })) } : undefined }, include: packageInclude })); } catch { res.status(404).json({ message: 'Tour package not found.' }); }
}
export async function deletePackage(req: Request, res: Response) { try { await prisma.package.delete({ where: { id: req.params.id } }); res.status(204).end(); } catch { res.status(404).json({ message: 'Tour package not found.' }); } }
