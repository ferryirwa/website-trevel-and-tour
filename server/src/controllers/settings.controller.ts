import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

/**
 * GET /api/admin/settings
 * Return semua key-value SiteSetting sebagai object.
 */
export async function getSettings(_req: Request, res: Response) {
  const rows = await prisma.siteSetting.findMany();
  const settings = rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});
  res.json(settings);
}

/**
 * POST /api/admin/settings
 * Body: { key: value, key2: value2, ... }
 * Upsert bulk. Simpan ke SiteSetting.
 */
export async function updateSettings(req: Request, res: Response) {
  const body = req.body as Record<string, unknown>;

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      success: false,
      message: 'Body must be an object of key-value pairs',
    });
  }

  const entries = Object.entries(body).filter(
    ([key, value]) =>
      typeof key === 'string' &&
      key.length > 0 &&
      key.length <= 100 &&
      (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
  );

  if (entries.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid settings provided',
    });
  }

  // Upsert tiap key
  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )
  );

  res.json({
    success: true,
    updated: entries.length,
    keys: entries.map(([k]) => k),
  });
}
