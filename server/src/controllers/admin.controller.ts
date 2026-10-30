import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export async function getDashboard(_req: Request, res: Response) {
  const [totalTours, pendingBookings, paidBookings, recentBookings] = await Promise.all([
    prisma.package.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.aggregate({ where: { status: { in: ['PAID', 'COMPLETED'] } }, _sum: { totalAmount: true } }),
    prisma.booking.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { package: { select: { nameEn: true } } } }),
  ]);
  res.json({ totalTours, pendingBookings, confirmedRevenue: paidBookings._sum.totalAmount || 0, recentBookings });
}
