import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import {
  uploadSettingImage,
  deleteSettingImage,
} from '../controllers/upload.controller.js';
import { requireAdmin } from '../middleware/auth.js';

// Pastikan folder ada
const uploadDir = path.join(process.cwd(), 'uploads', 'settings');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.post(
  '/image',
  requireAdmin,
  upload.single('file'),
  uploadSettingImage
);
router.delete('/image/:filename', requireAdmin, deleteSettingImage);

export default router;
