import { Router } from 'express';
import { createPayment, midtransWebhook } from '../controllers/payments.controller.js';

const router = Router();
router.post('/', createPayment);
router.post('/midtrans/webhook', midtransWebhook);

export default router;
