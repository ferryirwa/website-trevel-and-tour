import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5_000),
});

/* ---------- Public ---------- */

export async function createContactMessage(req: Request, res: Response) {
  const result = contactSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: 'Please complete all contact form fields correctly.',
    });
  }
  const message = await prisma.contactMessage.create({ data: result.data });
  res.status(201).json({
    id: message.id,
    message: 'Thank you. Your message has been sent.',
  });
}

/* ---------- Admin ---------- */

export async function listContactMessages(_req: Request, res: Response) {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(messages);
}

const statusSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED']),
});

export async function updateContactStatus(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Status must be one of NEW, READ, REPLIED.',
    });
  }
  try {
    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    res.json(updated);
  } catch {
    res.status(404).json({ message: 'Contact message not found.' });
  }
}

export async function deleteContactMessage(req: Request, res: Response) {
  const { id } = req.params;
  try {
    await prisma.contactMessage.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(404).json({ message: 'Contact message not found.' });
  }
}
