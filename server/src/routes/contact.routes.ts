import { Router } from 'express';
import {
  createContactMessage,
  listContactMessages,
  updateContactStatus,
  deleteContactMessage,
} from '../controllers/contact.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Public
router.post('/', createContactMessage);

// Admin
router.get('/admin', requireAdmin, listContactMessages);
router.patch('/:id/status', requireAdmin, updateContactStatus);
router.delete('/:id', requireAdmin, deleteContactMessage);

export default router;
