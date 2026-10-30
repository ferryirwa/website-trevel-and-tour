import { Router } from 'express';
import {
  listAdminUsers,
  createAdminUser,
  updateAdminUser,
  resetUserPassword,
  deleteAdminUser,
} from '../controllers/users.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAdmin, listAdminUsers);
router.post('/', requireAdmin, createAdminUser);
router.patch('/:id', requireAdmin, updateAdminUser);
router.patch('/:id/password', requireAdmin, resetUserPassword);
router.delete('/:id', requireAdmin, deleteAdminUser);

export default router;
