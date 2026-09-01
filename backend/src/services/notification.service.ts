import mongoose from 'mongoose';
import { Notification, INotification, NotificationType } from '../models/notification.model';
import { UserNotificationPreference, IUserNotificationPreference } from '../models/userNotificationPreference.model';
import { User } from '../models/user.model';
import { emailService } from './email.service';
import { ApiError } from '../utils/apiError';

export interface CreateNotificationDTO {
  userId: string | mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  entityId?: string;
  emailData?: {
    topicTitle?: string;
    percentage?: number;
    skillsCovered?: string[];
    assessmentTitle?: string;
    scoreText?: string;
    improvementText?: string;
    goalTitle?: string;
    category?: string;
    actionDescription?: string;
  };
}

export class NotificationService {
  async getOrCreatePreferences(userId: string): Promise<IUserNotificationPreference> {
    let pref = await UserNotificationPreference.findOne({ userId });
    if (!pref) {
      pref = await UserNotificationPreference.create({
        userId,
        emailLearningCompletion: true,
        emailAssessmentResults: true,
        emailGoalMilestones: true,
        emailSecurityNotifications: true,
        inAppLearning: true,
        inAppAssessments: true,
        inAppGoals: true,
        inAppAchievements: true,
      });
    }
    return pref;
  }

  async updatePreferences(userId: string, data: Partial<IUserNotificationPreference>): Promise<IUserNotificationPreference> {
    let pref = await UserNotificationPreference.findOne({ userId });
    if (!pref) {
      pref = new UserNotificationPreference({ userId, ...data });
    } else {
      Object.assign(pref, data);
    }
    await pref.save();
    return pref;
  }

  async createNotification(dto: CreateNotificationDTO): Promise<INotification | null> {
    try {
      const userIdStr = dto.userId.toString();
      const pref = await this.getOrCreatePreferences(userIdStr);

      // Check In-App Notification Preferences
      let allowInApp = true;
      if (dto.type === 'LEARNING_COMPLETED' && !pref.inAppLearning) allowInApp = false;
      if (dto.type === 'ASSESSMENT_COMPLETED' && !pref.inAppAssessments) allowInApp = false;
      if (dto.type === 'GOAL_COMPLETED' && !pref.inAppGoals) allowInApp = false;
      if (dto.type === 'ACHIEVEMENT' && !pref.inAppAchievements) allowInApp = false;

      // 60-Minute Deduplication Check
      if (dto.entityId) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const existing = await Notification.findOne({
          userId: dto.userId,
          type: dto.type,
          entityId: dto.entityId,
          createdAt: { $gte: oneHourAgo },
        });
        if (existing) {
          console.log(`[NotificationService] Duplicate notification suppressed for ${dto.type} (${dto.entityId})`);
          return existing;
        }
      }

      let createdNotification: INotification | null = null;
      if (allowInApp) {
        createdNotification = await Notification.create({
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          link: dto.link || '',
          entityId: dto.entityId || '',
          read: false,
        });
      }

      // Check Email Preferences & Dispatch Email Async
      const user = await User.findById(dto.userId);
      if (user && user.email) {
        let shouldSendEmail = false;
        if (dto.type === 'LEARNING_COMPLETED' && pref.emailLearningCompletion) shouldSendEmail = true;
        if (dto.type === 'ASSESSMENT_COMPLETED' && pref.emailAssessmentResults) shouldSendEmail = true;
        if (dto.type === 'GOAL_COMPLETED' && pref.emailGoalMilestones) shouldSendEmail = true;
        if (dto.type === 'PASSWORD_SECURITY' && pref.emailSecurityNotifications) shouldSendEmail = true;

        if (shouldSendEmail) {
          const emailData = dto.emailData || {};
          const uId = user._id.toString();
          if (dto.type === 'LEARNING_COMPLETED') {
            emailService.sendTrainingCompletionEmail(
              uId,
              user.email,
              user.name,
              emailData.topicTitle || dto.title,
              emailData.percentage || 100,
              emailData.skillsCovered || []
            );
          } else if (dto.type === 'ASSESSMENT_COMPLETED') {
            emailService.sendAssessmentCompletionEmail(
              uId,
              user.email,
              user.name,
              emailData.assessmentTitle || dto.title,
              emailData.percentage || 0,
              emailData.scoreText || '',
              emailData.improvementText || ''
            );
          } else if (dto.type === 'GOAL_COMPLETED') {
            emailService.sendGoalCompletionEmail(
              uId,
              user.email,
              user.name,
              emailData.goalTitle || dto.title,
              emailData.category || 'General'
            );
          } else if (dto.type === 'PASSWORD_SECURITY') {
            emailService.sendSecurityNotificationEmail(
              uId,
              user.email,
              user.name,
              emailData.actionDescription || dto.message
            );
          }
        }
      }

      return createdNotification;
    } catch (err) {
      console.error('[NotificationService Error] Failed to create notification:', err);
      return null;
    }
  }

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({ userId, read: false });
  }

  async markAsRead(userId: string, notificationId: string): Promise<INotification> {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
      throw new ApiError(404, 'Notification not found.');
    }
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    return notification;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const res = await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    return { modifiedCount: res.modifiedCount };
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const res = await Notification.deleteOne({ _id: notificationId, userId });
    return res.deletedCount > 0;
  }
}

export const notificationService = new NotificationService();
