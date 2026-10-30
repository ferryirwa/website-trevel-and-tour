import { Router } from 'express';
import { createPackage, deletePackage, getPackageBySlug, listAdminPackages, listPackages, updatePackage } from '../controllers/packages.controller.js';
import { requireAdmin } from '../middleware/auth.js';
import { packageUpload } from '../middleware/upload.js';

const router = Router();
router.get('/', listPackages);
router.get('/admin/all', requireAdmin, listAdminPackages);
router.post('/', requireAdmin, packageUpload.array('media', 8), createPackage);
router.patch('/:id', requireAdmin, packageUpload.array('media', 8), updatePackage);
router.delete('/:id', requireAdmin, deletePackage);
router.get('/:slug', getPackageBySlug);

export default router;
