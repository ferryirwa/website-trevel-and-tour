import { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function uploadSettingImage(req: Request, res: Response) {
  const file = (req as any).file as
    | { filename: string; mimetype: string; size: number }
    | undefined;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  if (!file.mimetype.startsWith('image/')) {
    return res.status(400).json({ message: 'Only image files are allowed.' });
  }

  if (file.size > 5 * 1024 * 1024) {
    return res.status(400).json({ message: 'File too large (max 5MB).' });
  }

  const url = `/uploads/settings/${file.filename}`;
  res.json({ url });
}

export async function deleteSettingImage(req: Request, res: Response) {
  const { filename } = req.params;

  // Prevent path traversal
  if (filename.includes('/') || filename.includes('..')) {
    return res.status(400).json({ message: 'Invalid filename.' });
  }

  const filePath = path.join(process.cwd(), 'uploads', 'settings', filename);

  try {
    await fs.unlink(filePath);
    res.json({ success: true });
  } catch {
    res.status(404).json({ message: 'File not found.' });
  }
}
