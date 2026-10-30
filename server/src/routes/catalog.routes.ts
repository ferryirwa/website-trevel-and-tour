import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();
router.get('/tour-types', async (_req, res) => res.json(await prisma.tourType.findMany({ orderBy: { nameEn: 'asc' } })));
router.get('/locations', async (_req, res) => res.json(await prisma.location.findMany({ orderBy: { name: 'asc' } })));
export default router;
