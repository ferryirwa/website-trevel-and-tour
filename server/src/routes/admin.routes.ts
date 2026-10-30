import { Router } from 'express';
import { getDashboard } from '../controllers/admin.controller.js';
import {
  getSettings,
  updateSettings,
} from '../controllers/settings.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', requireAdmin, getDashboard);
router.get('/settings', requireAdmin, getSettings);
router.post('/settings', requireAdmin, updateSettings);

export default router;
