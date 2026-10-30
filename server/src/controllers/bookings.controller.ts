import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { createBookingCode } from '../utils/bookingCode.js';

const bookingSchema = z.object({
  packageId: z.string().min(1),
  guestName: z.string().trim().min(2).max(120),
  guestEmail: z.string().email(),
  guestPhone: z.string().trim().min(6).max(30),
  guestCountry: z.string().trim().min(2).max(80),
  bookingDate: z.coerce.date(),
  timeSlot: z.string().trim().min(1).max(40),
  adults: z.coerce.number().int().min(1).max(50),
  children: z.coerce.number().int().min(0).max(50).default(0),
  notes: z.string().trim().max(1000).optional(),
});

export async function createBooking(req: Request, res: Response) {
  const parsed = bookingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Please check the booking information.', errors: parsed.error.flatten() });
  const input = parsed.data;
  if (input.bookingDate < new Date(new Date().toDateString())) return res.status(400).json({ message: 'Please choose a future tour date.' });
  const pkg = await prisma.package.findFirst({ where: { id: input.packageId, status: 'ACTIVE' } });
  if (!pkg) return res.status(404).json({ message: 'The selected tour is not available.' });
  const totalAmount = pkg.price * (input.adults + input.children * 0.5);
  const booking = await prisma.booking.create({ data: { ...input, bookingCode: createBookingCode(), totalAmount }, include: { package: true } });
  res.status(201).json(booking);
}

export async function getBookingByCode(req: Request, res: Response) {
  const booking = await prisma.booking.findUnique({ where: { bookingCode: req.params.bookingCode }, include: { package: true, payment: true } });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  res.json(booking);
}

const statusSchema = z.object({ status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'COMPLETED']) });
export async function listBookings(_req: Request, res: Response) {
  const bookings = await prisma.booking.findMany({ include: { package: { select: { nameEn: true } }, payment: true }, orderBy: { createdAt: 'desc' } });
  res.json(bookings);
}

export async function updateBookingStatus(req: Request, res: Response) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Choose a valid booking status.' });
  try {
    const booking = await prisma.booking.update({ where: { id: req.params.id }, data: { status: parsed.data.status }, include: { package: { select: { nameEn: true } }, payment: true } });
    if (parsed.data.status === 'PAID' && booking.payment) await prisma.payment.update({ where: { bookingId: booking.id }, data: { status: 'SUCCESS', paidAt: new Date() } });
    res.json(booking);
  } catch { res.status(404).json({ message: 'Booking not found.' }); }
}
