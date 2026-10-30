import { Router } from 'express';
import { createBooking, getBookingByCode, listBookings, updateBookingStatus } from '../controllers/bookings.controller.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.post('/', createBooking);
router.get('/', requireAdmin, listBookings);
router.patch('/:id/status', requireAdmin, updateBookingStatus);
router.get('/:bookingCode', getBookingByCode);

export default router;
