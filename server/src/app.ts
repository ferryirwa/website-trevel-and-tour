import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import packageRoutes from './routes/packages.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import paymentRoutes from './routes/payments.routes.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import usersRoutes from './routes/users.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import experienceRoutes from './routes/experiences.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import ratingsRoutes from './routes/ratings.routes.js';
import contactRoutes from './routes/contact.routes.js';
import path from 'node:path';
import catalogRoutes from './routes/catalog.routes.js';

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/catalog', catalogRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Visit Aikbukak API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root
app.get('/', (_req, res) => {
  res.json({ message: 'Visit Aikbukak API. See /api/health' });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
