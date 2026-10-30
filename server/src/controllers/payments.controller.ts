import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import crypto from 'node:crypto';

const paymentSchema = z.object({ bookingCode: z.string().min(1), method: z.enum(['CARD', 'PAYPAL', 'BANK', 'QRIS']) });

export async function createPayment(req: Request, res: Response) {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Choose a valid payment method.' });
  const booking = await prisma.booking.findUnique({ where: { bookingCode: parsed.data.bookingCode } });
  if (!booking) return res.status(404).json({ message: 'Booking not found.' });
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) return res.status(503).json({ message: 'Payment gateway is not configured yet.' });
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
  const baseUrl = isProduction ? 'https://app.midtrans.com' : 'https://app.sandbox.midtrans.com';
  const orderId = booking.bookingCode;
  const gatewayResponse = await fetch(`${baseUrl}/snap/v1/transactions`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString('base64')}` },
    body: JSON.stringify({
      transaction_details: { order_id: orderId, gross_amount: Math.round(booking.totalAmount) },
      customer_details: { first_name: booking.guestName, email: booking.guestEmail, phone: booking.guestPhone },
      callbacks: process.env.CLIENT_URL ? { finish: `${process.env.CLIENT_URL}/confirmation?booking=${encodeURIComponent(booking.bookingCode)}` } : undefined,
    }),
  });
  const gatewayData = await gatewayResponse.json() as { token?: string; redirect_url?: string; status_message?: string };
  if (!gatewayResponse.ok || !gatewayData.redirect_url) return res.status(502).json({ message: gatewayData.status_message || 'Unable to start the payment session.' });
  const payment = await prisma.payment.upsert({
    where: { bookingId: booking.id },
    update: { method: parsed.data.method, amount: booking.totalAmount, gatewayRef: orderId, status: 'PENDING' },
    create: { bookingId: booking.id, method: parsed.data.method, amount: booking.totalAmount, gatewayRef: orderId, status: 'PENDING' },
  });
  res.status(201).json({ payment, redirectUrl: gatewayData.redirect_url });
}

export async function midtransWebhook(req: Request, res: Response) {
  const notification = req.body as { order_id?: string; status_code?: string; gross_amount?: string; signature_key?: string; transaction_status?: string; fraud_status?: string };
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey || !notification.order_id || !notification.status_code || !notification.gross_amount || !notification.signature_key) return res.status(400).json({ message: 'Invalid payment notification.' });
  const signature = crypto.createHash('sha512').update(`${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(notification.signature_key))) return res.status(403).json({ message: 'Invalid notification signature.' });
  const success = ['settlement', 'capture'].includes(notification.transaction_status || '') && notification.fraud_status !== 'deny';
  const failed = ['cancel', 'deny', 'expire', 'failure'].includes(notification.transaction_status || '');
  await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { bookingCode: notification.order_id } });
    if (!booking) return;
    if (success) {
      await tx.payment.updateMany({ where: { bookingId: booking.id }, data: { status: 'SUCCESS', paidAt: new Date() } });
      await tx.booking.update({ where: { id: booking.id }, data: { status: 'PAID' } });
    } else if (failed) await tx.payment.updateMany({ where: { bookingId: booking.id }, data: { status: 'FAILED' } });
  });
  res.status(200).json({ received: true });
}
