import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';

const uploadDirectory = path.resolve(process.cwd(), 'uploads', 'experiences');
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDirectory),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    callback(null, safeName);
  },
});

export const experienceUpload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      callback(null, true);
      return;
    }
    callback(new Error('Only image and video files are allowed.'));
  },
});

const packageDirectory = path.resolve(process.cwd(), 'uploads', 'packages');
fs.mkdirSync(packageDirectory, { recursive: true });

export const packageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, packageDirectory),
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/')),
});

const galleryDirectory = path.resolve(process.cwd(), 'uploads', 'gallery');
fs.mkdirSync(galleryDirectory, { recursive: true });
export const galleryUpload = multer({ storage: multer.diskStorage({ destination: (_req, _file, callback) => callback(null, galleryDirectory), filename: (_req, file, callback) => callback(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`) }), limits: { fileSize: 10 * 1024 * 1024, files: 12 }, fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) });
