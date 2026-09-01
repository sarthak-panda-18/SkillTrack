import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';

export const getUserNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const result = await notificationService.getUserNotifications(req.user!.userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.status(200).json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await notificationService.markAsRead(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await notificationService.markAllAsRead(req.user!.userId);
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await notificationService.deleteNotification(req.user!.userId, req.params.id);
    res.status(200).json({
      success: true,
      message: deleted ? 'Notification deleted successfully' : 'Notification not found',
    });
  } catch (error) {
    next(error);
  }
};

export const getPreferences = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const preferences = await notificationService.getOrCreatePreferences(req.user!.userId);
    res.status(200).json({
      success: true,
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const preferences = await notificationService.updatePreferences(req.user!.userId, req.body);
    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
};
