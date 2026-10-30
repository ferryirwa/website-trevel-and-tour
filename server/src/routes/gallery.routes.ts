import { Router } from 'express';
import { listGallery } from '../controllers/gallery.controller.js';
import { createGallery, deleteGallery } from '../controllers/gallery.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { galleryUpload } from '../middleware/upload.js';

const router = Router();

router.get('/', listGallery);
router.post('/', requireAdmin, galleryUpload.array('media', 12), createGallery);
router.delete('/:id', requireAdmin, deleteGallery);

export default router;
