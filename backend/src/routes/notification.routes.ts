import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from '../controllers/notification.controller';

const router = Router();

// Protect ALL notification routes with JWT authentication
router.use(authenticate);

router.get('/', getUserNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
