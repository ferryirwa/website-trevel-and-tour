import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function listRatings(_req: Request, res: Response) {
  const snapshots = await prisma.ratingSnapshot.findMany({ orderBy: { fetchedAt: 'desc' } });
  const latestBySource = new Map();

  for (const snapshot of snapshots) {
    if (!latestBySource.has(snapshot.source)) latestBySource.set(snapshot.source, snapshot);
  }

  res.json([...latestBySource.values()]);
}
